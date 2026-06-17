import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { id: user.id } })
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Export transaksi 30 hari terakhir
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    include: {
      customer: { select: { fullName: true } },
      orderSellers: {
        include: {
          petani: { select: { farmName: true } },
          items: { select: { productNameSnapshot: true, quantity: true, subtotal: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Build CSV
  const rows = ['ID Order,Kode Order,Pembeli,Petani,Produk,Jumlah,Subtotal,Total Order,Metode Bayar,Status,Tanggal']

  for (const order of orders) {
    for (const seller of order.orderSellers) {
      for (const item of seller.items) {
        rows.push([
          order.id,
          order.orderCode,
          order.customer.fullName,
          seller.petani.farmName,
          item.productNameSnapshot,
          item.quantity,
          item.subtotal,
          order.total,
          order.paymentMethod,
          order.paymentStatus,
          new Date(order.createdAt).toISOString(),
        ].join(','))
      }
    }
  }

  const csv = rows.join('\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="laporan-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
