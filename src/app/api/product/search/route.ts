import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || q.trim() === '') {
    return NextResponse.json({ products: [] })
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive',
        },
        isActive: true,
      },
      include: {
        petani: {
          select: {
            farmName: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      take: 5,
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 })
  }
}
