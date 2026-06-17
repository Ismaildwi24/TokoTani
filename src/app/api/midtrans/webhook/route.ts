import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function verify(payload: any, sigKey: string): boolean {
  const signatureString = `${payload.order_id}${payload.status_code}${payload.gross_amount}${sigKey}`
  const hash = crypto.createHash('sha512').update(signatureString).digest('hex')
  return hash === payload.signature_key
}

export async function POST(request: Request) {
  const body = await request.json()

  // Verifikasi signature key WAJIB
  if (!verify(body, process.env.MIDTRANS_SERVER_KEY!)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const { order_id, transaction_status, fraud_status, transaction_id, payment_type, gross_amount } = body

  // Cari order
  const order = await prisma.order.findFirst({
    where: { midtransOrderId: order_id },
    include: {
      orderSellers: { select: { id: true, petaniId: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const isPaid =
    (transaction_status === 'capture' && fraud_status === 'accept') ||
    transaction_status === 'settlement'
  const isFailed = ['cancel', 'expire', 'deny'].includes(transaction_status)
  const isPending = transaction_status === 'pending'

  await prisma.$transaction(async (tx) => {
    if (isPaid) {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          midtransTransactionId: transaction_id,
          midtransPaymentType: payment_type,
          midtransRawPayload: body,
        },
      })

      // Update semua order seller ke DIPROSES
      await tx.orderSeller.updateMany({
        where: { orderId: order.id },
        data: { status: 'DIPROSES' },
      })

      // Buat ledger entry untuk setiap petani
      const commSetting = await tx.platformSetting.findUnique({
        where: { key: 'commission_percentage' },
      })
      const commPct = parseFloat(commSetting?.value || '3.5')

      for (const seller of order.orderSellers) {
        const sellerItems = await tx.orderItem.findMany({
          where: { orderSellerId: seller.id },
        })
        const sellerTotal = sellerItems.reduce(
          (sum, i) => sum + parseFloat(i.subtotal as unknown as string),
          0
        )
        const commission = sellerTotal * (commPct / 100)
        const netEarning = sellerTotal - commission

        // Pendapatan bersih
        await tx.petaniLedger.create({
          data: {
            petaniId: seller.petaniId,
            type: 'SALE_EARNING',
            amount: netEarning,
            orderSellerId: seller.id,
            note: `Penjualan order #${order.orderCode}`,
          },
        })

        // Komisi
        await tx.petaniLedger.create({
          data: {
            petaniId: seller.petaniId,
            type: 'COMMISSION_FEE',
            amount: -commission,
            orderSellerId: seller.id,
            note: `Komisi platform ${commPct}% untuk order #${order.orderCode}`,
          },
        })
      }
    } else if (isFailed) {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' },
      })
    } else if (isPending) {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'PENDING' },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
