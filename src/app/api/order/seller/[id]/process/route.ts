import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { OrderSellerStatus } from '@prisma/client'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify petani owns this order
  const orderSeller = await prisma.orderSeller.findUnique({
    where: { id },
    select: { petaniId: true, status: true },
  })
  if (!orderSeller || orderSeller.petaniId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (orderSeller.status !== 'DIPROSES' && orderSeller.status !== 'MENUNGGU_PEMBAYARAN') {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
  }

  const { courierName, courierEta, shippingCost } = await request.json()
  if (!courierName) return NextResponse.json({ error: 'Kurir wajib dipilih' }, { status: 400 })

  await prisma.orderSeller.update({
    where: { id },
    data: {
      courierName,
      courierEta,
      shippingCost,
      status: OrderSellerStatus.DIKIRIM,
    },
  })

  return NextResponse.json({ ok: true })
}
