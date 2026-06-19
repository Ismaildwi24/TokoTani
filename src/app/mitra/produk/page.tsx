import { requireAuth } from '@/lib/auth-guard'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline'
import KelolaProdukClient from '@/components/petani/KelolaProdukClient'

export const metadata: Metadata = {
  title: 'Kelola Produk | Toko Tani',
}

export default async function MitraProdukPage() {
  const user = await requireAuth([UserRole.PETANI])

  const products = await prisma.product.findMany({
    where: { petaniId: user.id },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Format Decimal to number
  const formattedProducts = products.map(p => ({
    ...p,
    price: Number(p.price)
  }))

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/mitra" className="text-[#006E2F]">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="font-extrabold text-[#006E2F]">Kelola Panen</h1>
          </div>
          <Link href="/mitra/produk/baru" className="flex items-center gap-1 text-sm font-semibold text-[#006E2F] hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
            <PlusIcon className="w-4 h-4" />
            Upload Baru
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Daftar Hasil Panen</h2>
          <p className="text-gray-500 mt-1 text-sm">Kelola harga, stok, dan ketersediaan hasil panen Anda.</p>
        </div>

        <KelolaProdukClient initialProducts={formattedProducts} />
      </main>
    </div>
  )
}
