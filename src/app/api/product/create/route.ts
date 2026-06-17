import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== 'PETANI') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const petani = await prisma.petaniProfile.findUnique({ where: { userId: user.id } })
  if (!petani || petani.verificationStatus !== 'ACTIVE') {
    return NextResponse.json({ error: 'Akun belum diverifikasi' }, { status: 403 })
  }

  const { name, categoryId, price, unit, stock, description, isOrganic, isPesticideFree, photoUrls } = await request.json()

  if (!name || !categoryId || !price || !stock) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      categoryId,
      price,
      unit,
      stock: parseInt(stock),
      description,
      isOrganic: isOrganic || false,
      isPesticideFree: isPesticideFree || false,
      petaniId: user.id,
      isActive: true,
      images: {
        create: (photoUrls || []).map((url: string, i: number) => ({
          url,
          sortOrder: i,
        })),
      },
    },
    select: { id: true },
  })

  return NextResponse.json({ productId: product.id })
}
