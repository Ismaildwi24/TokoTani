import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-guard'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversationId = params.id

  // Verify access
  const convo = await prisma.chatConversation.findUnique({
    where: { id: conversationId }
  })

  if (!convo || (convo.customerId !== user.id && convo.petaniId !== user.id)) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
  }

  // Fetch messages
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' }
  })

  // Mark messages as read
  const unreadMessages = messages.filter(m => m.senderId !== user.id && !m.readAt)
  if (unreadMessages.length > 0) {
    await prisma.chatMessage.updateMany({
      where: {
        id: { in: unreadMessages.map(m => m.id) }
      },
      data: { readAt: new Date() }
    })
  }

  // Format messages
  const formatted = messages.map(m => ({
    id: m.id,
    content: m.content,
    isMine: m.senderId === user.id,
    createdAt: m.createdAt,
    readAt: m.readAt || (unreadMessages.find(u => u.id === m.id) ? new Date() : null)
  }))

  return NextResponse.json({ messages: formatted })
}

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const conversationId = params.id
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const convo = await prisma.chatConversation.findUnique({
      where: { id: conversationId }
    })

    if (!convo || (convo.customerId !== user.id && convo.petaniId !== user.id)) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: user.id,
        content: content.trim()
      }
    })

    return NextResponse.json({ message: {
      id: message.id,
      content: message.content,
      isMine: true,
      createdAt: message.createdAt,
      readAt: null
    } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
