import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Validate admin role
  const admin = await prisma.user.findUnique({ where: { id: user.id } })
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { approve, reason } = await request.json()

  const order = await prisma.order.findUnique({
    where: { id },
    include: { orderSellers: { select: { id: true, petaniId: true } } },
  })
  if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })

  if (approve) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          paymentStatus: 'PAID',
          manualVerifiedById: user.id,
          manualVerifiedAt: new Date(),
        },
      })

      await tx.orderSeller.updateMany({
        where: { orderId: id },
        data: { status: 'DIPROSES' },
      })

      // Buat ledger entries
      const commSetting = await tx.platformSetting.findUnique({
        where: { key: 'commission_percentage' },
      })
      const commPct = parseFloat(commSetting?.value || '3.5')

      for (const seller of order.orderSellers) {
        const sellerItems = await tx.orderItem.findMany({
          where: { orderSellerId: seller.id },
        })
        const total = sellerItems.reduce((s, i) => s + parseFloat(i.subtotal as unknown as string), 0)
        const commission = total * (commPct / 100)

        await tx.petaniLedger.create({
          data: {
            petaniId: seller.petaniId,
            type: 'SALE_EARNING',
            amount: total,
            orderSellerId: seller.id,
            note: `Penjualan (manual terverifikasi) order #${order.orderCode}`,
          },
        })
        await tx.petaniLedger.create({
          data: {
            petaniId: seller.petaniId,
            type: 'COMMISSION_FEE',
            amount: -commission,
            note: `Komisi ${commPct}% order #${order.orderCode}`,
          },
        })
      }
    })
  } else {
    await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: 'FAILED',
        manualVerifiedById: user.id,
        manualVerifiedAt: new Date(),
        manualRejectionReason: reason,
      },
    })
  }

  return NextResponse.json({ ok: true })
}
