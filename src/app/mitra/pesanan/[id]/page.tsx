import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import MitraPesananClient from '@/components/petani/MitraPesananClient'

export default async function MitraPesananDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireAuth([UserRole.PETANI])

  const orderSeller = await prisma.orderSeller.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          customer: { select: { id: true, fullName: true, avatarUrl: true } },
          shippingAddress: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              isOrganic: true,
              isPesticideFree: true,
              unit: true,
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            },
          },
        },
      },
    },
  })

  if (!orderSeller || orderSeller.petaniId !== user.id) notFound()

  return <MitraPesananClient orderSeller={orderSeller as any} currentUserId={user.id} />
}
