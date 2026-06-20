import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reviews } = body as { reviews: { orderItemId: string, productId: string, rating: number, comment: string }[] }

    if (!reviews || !Array.isArray(reviews)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Verify order belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId, customerId: user.id },
      include: { orderSellers: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found or forbidden' }, { status: 404 })
    }

    // Process reviews
    const promises = reviews.map(async (review) => {
      // Validate order item belongs to this order
      const orderItem = await prisma.orderItem.findUnique({
        where: { id: review.orderItemId },
        include: { orderSeller: true }
      })

      if (!orderItem || orderItem.orderSeller.orderId !== orderId || orderItem.orderSeller.status !== 'SELESAI') {
        throw new Error(`Invalid order item ${review.orderItemId}`)
      }

      // Upsert the review
      return prisma.review.upsert({
        where: { orderItemId: review.orderItemId },
        create: {
          orderItemId: review.orderItemId,
          productId: review.productId,
          customerId: user.id,
          rating: review.rating,
          comment: review.comment || null,
        },
        update: {
          rating: review.rating,
          comment: review.comment || null,
        }
      })
    })

    await Promise.all(promises)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Error submitting review:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
