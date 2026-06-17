import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CustomerHeader from '@/components/ui/CustomerHeader'
import Footer from '@/components/ui/Footer'
import ProductDetailClient from '@/components/customer/ProductDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, description: true },
  })
  if (!product) return { title: 'Produk tidak ditemukan' }
  return {
    title: `${product.name} — Toko Tani`,
    description: product.description || `Beli ${product.name} segar langsung dari petani lokal.`,
  }
}

async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id, isActive: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      petani: {
        select: {
          userId: true,
          farmName: true,
          location: true,
          bio: true,
          user: { select: { avatarUrl: true } },
        },
      },
      category: true,
      reviews: {
        include: {
          customer: { select: { fullName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
}

async function getRelated(categoryId: string, excludeId: string) {
  return prisma.product.findMany({
    where: { categoryId, isActive: true, id: { not: excludeId } },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      petani: { select: { farmName: true, location: true } },
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const related = await getRelated(product.categoryId, id)

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

  const serializedProduct = {
    ...product,
    price: parseFloat(product.price as unknown as string),
  }

  const serializedRelated = related.map((p) => ({
    ...p,
    price: parseFloat(p.price as unknown as string),
  }))

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <CustomerHeader />
      <ProductDetailClient
        product={serializedProduct as any}
        related={serializedRelated as any}
        avgRating={avgRating}
      />
      <Footer />
    </div>
  )
}
