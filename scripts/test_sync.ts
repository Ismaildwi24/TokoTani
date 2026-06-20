import { PrismaClient } from '@prisma/client'
import { syncOrderPaymentStatus } from '../src/lib/syncMidtrans'

const prisma = new PrismaClient()

async function main() {
  const pendingOrders = await prisma.order.findMany({
    where: { paymentStatus: 'PENDING', midtransOrderId: { not: null } }
  })

  console.log(`Found ${pendingOrders.length} pending orders`)
  for (const order of pendingOrders) {
    console.log(`Syncing order ${order.id} with midtransOrderId: ${order.midtransOrderId}`)
    try {
      const res = await syncOrderPaymentStatus(order.id)
      console.log('Result:', res?.paymentStatus)
    } catch (e) {
      console.error(e)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
