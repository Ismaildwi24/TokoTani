import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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

    const admin = await prisma.user.findUnique({ where: { id: user.id } })
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (status !== 'RESOLVED' && status !== 'DISMISSED') {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(report)
  } catch (error: any) {
    console.error('Error resolving report:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
