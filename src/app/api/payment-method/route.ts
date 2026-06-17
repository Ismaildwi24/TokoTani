import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-guard'

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { providerName, accountNumber, accountHolder, isDefault } = body

    // Jika set as default, ubah semua metode lama jadi non-default
    if (isDefault) {
      await prisma.savedPaymentMethod.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    // Jika ini adalah metode pertama, otomatis jadikan default
    const count = await prisma.savedPaymentMethod.count({
      where: { userId: user.id },
    })
    const willBeDefault = count === 0 ? true : isDefault

    const method = await prisma.savedPaymentMethod.create({
      data: {
        userId: user.id,
        providerName,
        accountNumber,
        accountHolder,
        isDefault: willBeDefault,
      },
    })

    return NextResponse.json({ method }, { status: 201 })
  } catch (error) {
    console.error('Failed to save payment method:', error)
    return NextResponse.json({ error: 'Failed to save payment method' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, providerName, accountNumber, accountHolder, isDefault } = body

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const existingMethod = await prisma.savedPaymentMethod.findUnique({ where: { id } })
    if (!existingMethod || existingMethod.userId !== user.id) {
      return NextResponse.json({ error: 'Method not found' }, { status: 404 })
    }

    if (isDefault) {
      await prisma.savedPaymentMethod.updateMany({
        where: { userId: user.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const method = await prisma.savedPaymentMethod.update({
      where: { id },
      data: {
        providerName: providerName !== undefined ? providerName : undefined,
        accountNumber: accountNumber !== undefined ? accountNumber : undefined,
        accountHolder: accountHolder !== undefined ? accountHolder : undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined,
      },
    })

    return NextResponse.json({ method })
  } catch (error) {
    console.error('Failed to update payment method:', error)
    return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  try {
    const existingMethod = await prisma.savedPaymentMethod.findUnique({ where: { id } })
    if (!existingMethod || existingMethod.userId !== user.id) {
      return NextResponse.json({ error: 'Method not found' }, { status: 404 })
    }

    await prisma.savedPaymentMethod.delete({ where: { id } })

    // Jika yang dihapus adalah default, jadikan metode pertama (jika ada) sebagai default
    if (existingMethod.isDefault) {
      const firstMethod = await prisma.savedPaymentMethod.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      })
      if (firstMethod) {
        await prisma.savedPaymentMethod.update({
          where: { id: firstMethod.id },
          data: { isDefault: true },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete payment method:', error)
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 })
  }
}
