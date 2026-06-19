import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-guard'

export async function GET(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isPetani = user.role === 'PETANI'

  const conversations = await prisma.chatConversation.findMany({
    where: isPetani ? { petaniId: user.id } : { customerId: user.id },
    include: {
      customer: { select: { fullName: true, avatarUrl: true } },
      petani: { select: { farmName: true, user: { select: { avatarUrl: true } } } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Format response for the client
  const formatted = conversations.map(c => {
    const partnerName = isPetani ? c.customer.fullName : c.petani.farmName
    const partnerAvatar = isPetani ? c.customer.avatarUrl : c.petani.user.avatarUrl
    const partnerId = isPetani ? c.customerId : c.petaniId
    const lastMessage = c.messages[0]

    return {
      id: c.id,
      partnerId,
      partnerName,
      partnerAvatar,
      lastMessage: lastMessage ? {
        content: lastMessage.content,
        createdAt: lastMessage.createdAt,
        isMine: lastMessage.senderId === user.id,
        readAt: lastMessage.readAt
      } : null,
      orderId: c.orderId
    }
  })

  return NextResponse.json({ conversations: formatted })
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { partnerId, orderId } = await request.json()
    if (!partnerId) return NextResponse.json({ error: 'partnerId is required' }, { status: 400 })

    const isPetani = user.role === 'PETANI'
    
    const customerId = isPetani ? partnerId : user.id
    const petaniId = isPetani ? user.id : partnerId

    let conversation = await prisma.chatConversation.findFirst({
      where: { customerId, petaniId, orderId: orderId || null }
    })

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          customerId,
          petaniId,
          orderId: orderId || null
        }
      })
    }

    return NextResponse.json({ conversationId: conversation.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
