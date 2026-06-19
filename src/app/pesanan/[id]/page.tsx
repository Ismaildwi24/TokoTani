import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { notFound } from 'next/navigation'
import CustomerHeader from '@/components/ui/CustomerHeader'
import Footer from '@/components/ui/Footer'
import PesananDetailClient from '@/components/customer/PesananDetailClient'

export const metadata = {
  title: 'Detail Pesanan | Toko Tani'
}

export default async function PesananDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth([UserRole.CUSTOMER])
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: {
      id,
      customerId: user.id
    },
    include: {
      shippingAddress: true,
      orderSellers: {
        include: {
          petani: {
            select: { farmName: true }
          },
          items: {
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                    orderBy: { sortOrder: 'asc' }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  // Serialize Decimal objects before sending to client
  const serializedOrder = {
    ...order,
    total: parseFloat(order.total as unknown as string),
    subtotal: parseFloat(order.subtotal as unknown as string),
    totalShippingCost: parseFloat(order.totalShippingCost as unknown as string),
    orderSellers: order.orderSellers.map(os => ({
      ...os,
      shippingCost: parseFloat(os.shippingCost as unknown as string),
      items: os.items.map(item => ({
        ...item,
        priceSnapshot: parseFloat(item.priceSnapshot as unknown as string),
        subtotal: parseFloat(item.subtotal as unknown as string)
      }))
    }))
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <CustomerHeader />
      <PesananDetailClient order={serializedOrder as any} />
      <Footer />
    </div>
  )
}
