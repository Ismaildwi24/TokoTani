import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, quantity } = await request.json()
  if (!productId || !quantity) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })

  // Validasi stok
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || !product.isActive) return NextResponse.json({ error: 'Produk tidak tersedia' }, { status: 404 })
  if (product.stock < quantity) return NextResponse.json({ error: 'Stok tidak mencukupi' }, { status: 400 })

  // Upsert cart
  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  })

  // Upsert item
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.userId, productId } },
  })

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    })
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.userId, productId, quantity },
    })
  }

  return NextResponse.json({ ok: true })
}
