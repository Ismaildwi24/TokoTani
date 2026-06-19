import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findUnique({
    where: { id: params.id }
  })

  if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
  if (product.petaniId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { price, stock, isActive } = await request.json()

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(isActive !== undefined && { isActive })
    }
  })

  return NextResponse.json({ product: updated })
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { orderItems: true }
      }
    }
  })

  if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
  if (product.petaniId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (product._count.orderItems > 0) {
    // Soft delete / Archive
    await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false }
    })
    return NextResponse.json({ message: 'Produk telah dinonaktifkan karena memiliki riwayat pesanan', softDeleted: true })
  }

  // Hard delete
  await prisma.product.delete({
    where: { id: params.id }
  })
  
  // Note: we might also want to delete images from Supabase storage if we were thorough,
  // but Prisma cascades ProductImage deletion from DB via `onDelete: Cascade`.
  
  return NextResponse.json({ message: 'Produk berhasil dihapus' })
}
