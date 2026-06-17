import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { id: user.id } })
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })

  await prisma.product.update({
    where: { id },
    data: { isFeatured: !product.isFeatured },
  })

  return NextResponse.json({ isFeatured: !product.isFeatured })
}
