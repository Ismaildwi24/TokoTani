import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { midtrans } from '@/lib/midtrans'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId } = await request.json()

  // Ambil order dari DB (tidak percaya client untuk gross_amount)
  const order = await prisma.order.findUnique({
    where: { id: orderId, customerId: user.id },
    include: {
      customer: { select: { fullName: true, email: true, phone: true } },
      orderSellers: {
        include: {
          items: { select: { productNameSnapshot: true, quantity: true, priceSnapshot: true } },
        },
      },
    },
  })

  if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })

  const itemDetails: any[] = []
  for (const seller of order.orderSellers) {
    for (const item of seller.items) {
      itemDetails.push({
        id: item.productNameSnapshot.slice(0, 50),
        name: item.productNameSnapshot,
        price: parseFloat(item.priceSnapshot as unknown as string),
        quantity: item.quantity,
      })
    }
  }

  const snapToken = await midtrans.createTransaction({
    transaction_details: {
      order_id: `TT-${order.orderCode}-${Date.now()}`,
      gross_amount: parseFloat(order.total as unknown as string),
    },
    item_details: itemDetails,
    customer_details: {
      first_name: order.customer.fullName,
      email: order.customer.email,
      phone: order.customer.phone || '',
    },
  } as any)

  // Simpan midtransOrderId
  await prisma.order.update({
    where: { id: orderId },
    data: { midtransOrderId: `TT-${order.orderCode}-${Date.now()}` },
  })

  return NextResponse.json({ snapToken: snapToken.token })
}
