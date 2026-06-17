import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import ChatClient from '@/components/chat/ChatClient'

export default async function ChatConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  const user = await requireAuth([UserRole.CUSTOMER, UserRole.PETANI])

  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId },
    include: {
      customer: { select: { id: true, fullName: true, avatarUrl: true } },
      petani: {
        select: {
          userId: true,
          farmName: true,
          user: { select: { fullName: true, avatarUrl: true } },
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          content: true,
          attachmentUrl: true,
          senderId: true,
          createdAt: true,
        },
      },
    },
  })

  if (!conversation) notFound()

  // Verify access — only participants
  if (
    conversation.customerId !== user.id &&
    conversation.petaniId !== user.id
  ) {
    notFound()
  }

  // Load order if linked
  let orderWithDetails = null
  if (conversation.orderId) {
    orderWithDetails = await prisma.order.findUnique({
      where: { id: conversation.orderId },
      select: {
        id: true,
        orderCode: true,
        shippingAddress: {
          select: { fullAddress: true, city: true, province: true },
        },
        orderSellers: {
          where: { petaniId: conversation.petaniId },
          select: {
            status: true,
            items: {
              select: {
                productNameSnapshot: true,
                quantity: true,
                product: {
                  select: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
                },
              },
            },
          },
        },
      },
    })
  }

  const messages = conversation.messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }))

  return (
    <ChatClient
      conversation={{ ...conversation, order: orderWithDetails }}
      messages={messages}
      currentUserId={user.id}
    />
  )
}
