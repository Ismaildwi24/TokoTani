import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const amount = parseFloat(body.amount)

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Nominal tidak valid' }, { status: 400 })
    }

    // Ambil profile petani
    const profile = await prisma.petaniProfile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) return NextResponse.json({ error: 'Profil petani tidak ditemukan' }, { status: 404 })

    if (!profile.bankName || !profile.bankAccountNumber || !profile.bankAccountHolder) {
      return NextResponse.json({ error: 'Informasi rekening bank belum lengkap. Silakan lengkapi di profil Anda.' }, { status: 400 })
    }

    // Hitung saldo
    const ledger = await prisma.petaniLedger.aggregate({
      where: { petaniId: user.id },
      _sum: { amount: true }
    })
    
    const balance = Number(ledger._sum.amount || 0)

    if (amount > balance) {
      return NextResponse.json({ error: 'Saldo tidak mencukupi' }, { status: 400 })
    }

    // Lakukan transaksi (transaction)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat request withdrawal
      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          petaniId: user.id,
          amount,
          bankNameSnapshot: profile.bankName!,
          bankAccountSnapshot: `${profile.bankAccountNumber} a.n ${profile.bankAccountHolder}`,
          status: 'PENDING'
        }
      })

      // 2. Potong saldo
      await tx.petaniLedger.create({
        data: {
          petaniId: user.id,
          type: 'WITHDRAWAL',
          amount: -amount,
          withdrawalId: withdrawal.id,
          note: 'Penarikan Dana (Pending)'
        }
      })

      return withdrawal
    })

    return NextResponse.json({ message: 'Permintaan penarikan dana berhasil diajukan', withdrawal: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan' }, { status: 500 })
  }
}
