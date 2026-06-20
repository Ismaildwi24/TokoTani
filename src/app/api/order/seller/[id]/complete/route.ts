import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderSeller = await prisma.orderSeller.findUnique({
      where: { id },
      include: { order: true },
    })

    if (!orderSeller) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Hanya customer pemilik pesanan yang bisa menyelesaikan pesanan
    if (orderSeller.order.customerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (orderSeller.status !== 'DIKIRIM') {
      return NextResponse.json({ error: 'Pesanan tidak dalam status DIKIRIM' }, { status: 400 })
    }

    await prisma.orderSeller.update({
      where: { id },
      data: { status: 'SELESAI' },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Error completing order:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
