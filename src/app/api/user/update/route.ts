import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fullName, email, phone, gender, avatarUrl, bankName, bankAccountNumber, bankAccountHolder } = await request.json()

  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName,
      email,
      phone,
      gender: gender || null,
      avatarUrl,
    },
  })

  if (bankName !== undefined) {
    await prisma.petaniProfile.update({
      where: { userId: user.id },
      data: {
        bankName,
        bankAccountNumber,
        bankAccountHolder,
      }
    })
  }

  return NextResponse.json({ ok: true })
}
