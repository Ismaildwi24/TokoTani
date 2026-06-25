import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { proofUrl } = await request.json()
  if (!proofUrl) {
    return NextResponse.json({ error: 'URL bukti pembayaran tidak ada' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
  })

  if (!order || order.customerId !== user.id) {
    return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
  }

  if (order.paymentMethod !== 'MANUAL_TRANSFER' || order.paymentStatus !== 'PENDING') {
    return NextResponse.json({ error: 'Pesanan ini tidak dapat menerima unggahan bukti' }, { status: 400 })
  }

  // Update order dengan manualProofUrl
  await prisma.order.update({
    where: { id: params.id },
    data: {
      manualProofUrl: proofUrl,
    },
  })

  return NextResponse.json({ success: true, url: proofUrl })
}
