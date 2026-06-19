import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { id: user.id } })
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { action } = await request.json()

  const statusMap: Record<string, string> = {
    suspend: 'SUSPENDED',
    block: 'REJECTED',
    activate: 'ACTIVE',
    verifyPetani: 'ACTIVE',
  }

  const newStatus = statusMap[action]
  if (!newStatus) return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 })

  await prisma.user.update({
    where: { id },
    data: { status: newStatus as any },
  })

  if (action === 'verifyPetani') {
    await prisma.petaniProfile.update({
      where: { userId: id },
      data: { verificationStatus: 'ACTIVE' }
    })
  }

  return NextResponse.json({ ok: true })
}
