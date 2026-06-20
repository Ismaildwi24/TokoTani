import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { notFound } from 'next/navigation'
import CustomerHeader from '@/components/ui/CustomerHeader'
import Footer from '@/components/ui/Footer'
import UlasanFormClient from '@/components/customer/UlasanFormClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Beri Ulasan | Toko Tani'
}

export default async function UlasanPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth([UserRole.CUSTOMER])
  const { id } = await params

  // Ambil order seller yg SELESAI
  const order = await prisma.order.findUnique({
    where: { id, customerId: user.id },
    include: {
      orderSellers: {
        where: { status: 'SELESAI' },
        include: {
          petani: { select: { farmName: true } },
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1, orderBy: { sortOrder: 'asc' } }
                }
              },
              review: true // See if already reviewed
            }
          }
        }
      }
    }
  })

  if (!order || order.orderSellers.length === 0) {
    notFound()
  }

  // Format data for client
  const itemsToReview = order.orderSellers.flatMap(os => 
    os.items.map(item => ({
      orderItemId: item.id,
      productId: item.productId,
      productName: item.productNameSnapshot,
      farmName: os.petani.farmName,
      imageUrl: item.product.images[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
      existingReview: item.review ? {
        rating: item.review.rating,
        comment: item.review.comment
      } : null
    }))
  )

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <CustomerHeader />
      <UlasanFormClient orderId={order.id} items={itemsToReview as any} />
      <Footer />
    </div>
  )
}
