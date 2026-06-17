import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserRole, UserStatus } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, email, fullName, phone, role, avatarUrl, farmName, location } = body

    if (!id || !email || !fullName || !role) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const userRole = role as UserRole
    const status =
      userRole === UserRole.PETANI
        ? UserStatus.PENDING_VERIFICATION
        : UserStatus.ACTIVE

    // Upsert user (create atau update)
    const user = await prisma.user.upsert({
      where: { id },
      create: {
        id,
        email,
        fullName,
        phone: phone || null,
        role: userRole,
        status,
        avatarUrl: avatarUrl || null,
      },
      update: {
        email,
        fullName,
        avatarUrl: avatarUrl || null,
      },
    })

    // Jika petani, buat PetaniProfile juga
    if (userRole === UserRole.PETANI && farmName && location) {
      await prisma.petaniProfile.upsert({
        where: { userId: id },
        create: {
          userId: id,
          farmName,
          location,
          verificationStatus: UserStatus.PENDING_VERIFICATION,
        },
        update: {},
      })
    }

    // Buat cart untuk customer
    if (userRole === UserRole.CUSTOMER) {
      await prisma.cart.upsert({
        where: { userId: id },
        create: { userId: id },
        update: {},
      })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json({ error: 'Gagal membuat akun' }, { status: 500 })
  }
}
