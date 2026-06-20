import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { midtrans } from '@/lib/midtrans'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id, customerId: user.id },
      include: { orderSellers: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    if (order.paymentStatus !== 'PENDING') {
      return NextResponse.json({ error: 'Hanya pesanan yang menunggu pembayaran yang dapat dibatalkan' }, { status: 400 })
    }

    // Update DB to Cancelled/Failed
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' }
      })

      await tx.orderSeller.updateMany({
        where: { orderId: order.id },
        data: { status: 'DIBATALKAN' }
      })
    })

    // Optionally try to cancel in Midtrans if it exists
    if (order.midtransOrderId) {
      try {
        const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
        const base64Key = Buffer.from(serverKey + ':').toString('base64')
        const apiUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true' 
          ? `https://api.midtrans.com/v2/${order.midtransOrderId}/cancel`
          : `https://api.sandbox.midtrans.com/v2/${order.midtransOrderId}/cancel`

        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${base64Key}`
          }
        })
      } catch (midtransError) {
        console.warn('Failed to cancel midtrans transaction. It might already be expired or not created yet.', midtransError)
      }
    }

    return NextResponse.json({ ok: true, message: 'Pesanan berhasil dibatalkan' })

  } catch (error: any) {
    console.error('Cancel order error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 })
  }
}
