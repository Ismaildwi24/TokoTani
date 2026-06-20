import { prisma } from './prisma'
import { midtrans } from './midtrans'

export async function syncOrderPaymentStatus(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderSellers: { select: { id: true, petaniId: true } },
    },
  })

  if (!order || !order.midtransOrderId) return order

  if (order.paymentStatus === 'PAID' || order.paymentStatus === 'FAILED') return order

  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    const base64Key = Buffer.from(serverKey + ':').toString('base64')
    const apiUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true' 
      ? `https://api.midtrans.com/v2/${order.midtransOrderId}/status`
      : `https://api.sandbox.midtrans.com/v2/${order.midtransOrderId}/status`

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${base64Key}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) return order
      throw new Error(`Midtrans API error: ${response.statusText}`)
    }

    const statusResponse = await response.json()
    
    const { transaction_status, fraud_status, transaction_id, payment_type } = statusResponse
    
    const isPaid =
      (transaction_status === 'capture' && fraud_status === 'accept') ||
      transaction_status === 'settlement'
    const isFailed = ['cancel', 'expire', 'deny'].includes(transaction_status)

    if (!isPaid && !isFailed) {
      return order // masih pending
    }

    await prisma.$transaction(async (tx) => {
      if (isPaid) {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            midtransTransactionId: transaction_id,
            midtransPaymentType: payment_type,
            midtransRawPayload: statusResponse as any,
          },
        })

        await tx.orderSeller.updateMany({
          where: { orderId: order.id },
          data: { status: 'DIPROSES' },
        })

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
          await tx.petaniLedger.create({
            data: {
              petaniId: seller.petaniId,
              type: 'SALE_EARNING',
              amount: sellerTotal,
              orderSellerId: seller.id,
              note: `Penjualan order #${order.orderCode}`,
            },
          })

          await tx.petaniLedger.create({
            data: {
              petaniId: seller.petaniId,
              type: 'COMMISSION_FEE',
              amount: -commission,
              note: `Komisi platform ${commPct}% untuk order #${order.orderCode}`,
            },
          })
        }
      } else if (isFailed) {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'FAILED' },
        })
        await tx.orderSeller.updateMany({
          where: { orderId: order.id },
          data: { status: 'DIBATALKAN' },
        })
      }
    })
    
    return await prisma.order.findUnique({ where: { id: order.id } })
  } catch (error: any) {
    // 404 dari midtrans berarti transaksi belum dibuat / expired / dihapus
    if (error?.httpStatusCode !== 404) {
      console.error('Failed to sync midtrans status', error)
    }
    return order
  }
}
