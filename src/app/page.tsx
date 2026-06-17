import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import CustomerHeader from '@/components/ui/CustomerHeader'
import Footer from '@/components/ui/Footer'
import CustomerDashboard from '@/components/customer/CustomerDashboard'

export const metadata: Metadata = {
  title: 'Toko Tani — Sayur Segar Langsung dari Petani Lokal',
  description: 'Beli sayur, buah, dan bumbu segar langsung dari petani lokal terpercaya.',
}

async function getFeaturedProducts(q?: string, category?: string) {
  const where = {
    isActive: true,
    ...(category && category !== 'semua'
      ? { category: { slug: category } }
      : {}),
    ...(q
      ? { name: { contains: q, mode: 'insensitive' as const } }
      : {}),
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      petani: { select: { farmName: true, location: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { reviews: true, orderItems: true } },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: 12,
  })

  return products
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string }>
}) {
  const params = await searchParams
  const [products, categories] = await Promise.all([
    getFeaturedProducts(params.q, params.kategori),
    getCategories(),
  ])

  const serializedProducts = products.map((p) => ({
    ...p,
    price: parseFloat(p.price as unknown as string),
  }))

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <CustomerHeader />
      <CustomerDashboard
        products={serializedProducts as any}
        categories={categories}
        query={params.q}
        activeCategory={params.kategori}
      />
      <Footer />
    </div>
  )
}
