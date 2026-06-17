import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { label, recipientName, phone, fullAddress, city, province, postalCode, isDefault } = body

    // Jika set as default, ubah semua alamat lama jadi non-default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    // Jika ini adalah alamat pertama, jadikan default otomatis
    const existingCount = await prisma.address.count({ where: { userId: user.id } })
    const willBeDefault = isDefault || existingCount === 0

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label,
        recipientName,
        phone,
        fullAddress,
        city,
        province,
        postalCode,
        isDefault: willBeDefault,
      },
    })

    return NextResponse.json({ ok: true, address })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, label, recipientName, phone, fullAddress, city, province, postalCode, isDefault } = body

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    // Validasi kepemilikan
    const existing = await prisma.address.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        label: label !== undefined ? label : undefined,
        recipientName: recipientName !== undefined ? recipientName : undefined,
        phone: phone !== undefined ? phone : undefined,
        fullAddress: fullAddress !== undefined ? fullAddress : undefined,
        city: city !== undefined ? city : undefined,
        province: province !== undefined ? province : undefined,
        postalCode: postalCode !== undefined ? postalCode : undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined,
      },
    })

    return NextResponse.json({ ok: true, address })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    // Validasi kepemilikan
    const existing = await prisma.address.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    await prisma.address.delete({ where: { id } })

    // Jika yang dihapus adalah default, jadikan alamat pertama lainnya default
    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId: user.id },
      })
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
