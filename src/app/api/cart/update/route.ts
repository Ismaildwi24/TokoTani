import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId, quantity } = await request.json()
  if (!itemId || quantity < 1) return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })

  // Verify ownership
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId: user.id } },
  })
  if (!item) return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 })

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } })
  return NextResponse.json({ ok: true })
}
