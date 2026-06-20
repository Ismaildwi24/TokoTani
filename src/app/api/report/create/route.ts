import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reason, detail, orderId } = body

    if (!reason || !detail) {
      return NextResponse.json({ error: 'Alasan dan detail keluhan harus diisi' }, { status: 400 })
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        reason,
        detail,
        orderId: orderId || null,
        status: 'OPEN',
      },
    })

    return NextResponse.json(report)
  } catch (error: any) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
