import { requireAuth } from '@/lib/auth-guard'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import TarikDanaClient from '@/components/petani/TarikDanaClient'

export const metadata: Metadata = {
  title: 'Tarik Dana | Toko Tani',
}

export default async function TarikDanaPage() {
  const user = await requireAuth([UserRole.PETANI])

  const profile = await prisma.petaniProfile.findUnique({
    where: { userId: user.id }
  })

  // Hitung saldo
  const ledger = await prisma.petaniLedger.aggregate({
    where: { petaniId: user.id },
    _sum: { amount: true }
  })
  const balance = Number(ledger._sum.amount || 0)

  // Ambil riwayat penarikan
  const history = await prisma.withdrawalRequest.findMany({
    where: { petaniId: user.id },
    orderBy: { createdAt: 'desc' }
  })

  const formattedHistory = history.map(item => ({
    id: item.id,
    amount: Number(item.amount),
    status: item.status,
    createdAt: item.createdAt,
    adminNote: item.adminNote
  }))

  const bankInfo = {
    bankName: profile?.bankName || null,
    bankAccountNumber: profile?.bankAccountNumber || null,
    bankAccountHolder: profile?.bankAccountHolder || null
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/mitra" className="text-[#006E2F]">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="font-extrabold text-[#006E2F]">Tarik Dana</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Pencairan Dana Hasil Panen</h2>
          <p className="text-gray-500 mt-1 text-sm">Dana akan ditransfer ke rekening bank yang terdaftar di profil Anda.</p>
        </div>

        <TarikDanaClient 
          balance={balance} 
          bankInfo={bankInfo} 
          history={formattedHistory} 
        />
      </main>
    </div>
  )
}
