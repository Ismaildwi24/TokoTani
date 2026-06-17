import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversationId, content } = await request.json()
  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  // Validate participant
  const conv = await prisma.chatConversation.findUnique({
    where: { id: conversationId },
    select: { customerId: true, petaniId: true },
  })
  if (!conv) return NextResponse.json({ error: 'Conversation tidak ditemukan' }, { status: 404 })
  if (conv.customerId !== user.id && conv.petaniId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const message = await prisma.chatMessage.create({
    data: {
      conversationId,
      senderId: user.id,
      content: content.trim(),
    },
    select: {
      id: true,
      content: true,
      attachmentUrl: true,
      senderId: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    message: { ...message, createdAt: message.createdAt.toISOString() },
  })
}
