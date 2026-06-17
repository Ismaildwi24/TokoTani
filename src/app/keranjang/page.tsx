import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import CustomerHeader from '@/components/ui/CustomerHeader'
import Footer from '@/components/ui/Footer'
import KeranjangClient from '@/components/customer/KeranjangClient'
import { UserRole } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Keranjang Belanja — Toko Tani',
}

export default async function KeranjangPage() {
  const user = await requireAuth([UserRole.CUSTOMER])

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              petani: { select: { farmName: true } },
            },
          },
        },
        orderBy: { product: { name: 'asc' } },
      },
    },
  })

  const serializedItems = (cart?.items ?? []).map((i) => ({
    ...i,
    product: {
      ...i.product,
      price: parseFloat(i.product.price as unknown as string),
    },
  }))

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <CustomerHeader />
      <KeranjangClient items={serializedItems as any} />
      <Footer />
    </div>
  )
}
