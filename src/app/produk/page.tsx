import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import CustomerHeader from '@/components/ui/CustomerHeader'
import Footer from '@/components/ui/Footer'
import ProdukListClient, { CatalogProductData, CategoryData } from '@/components/customer/ProdukListClient'

export const metadata: Metadata = {
  title: 'Semua Produk | Toko Tani',
  description: 'Jelajahi berbagai sayur, buah, dan bumbu segar langsung dari petani lokal.',
}

// Force dynamic page so it always gets the latest products
export const dynamic = 'force-dynamic'

export default async function SemuaProdukPage() {
  // Fetch active products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      petani: true,
      images: {
        take: 1,
        orderBy: { sortOrder: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch all categories for the filter
  const categoriesDb = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  // Map to client data
  const catalogProducts: CatalogProductData[] = products.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    unit: p.unit,
    stock: p.stock,
    isOrganic: p.isOrganic,
    isPesticideFree: p.isPesticideFree,
    imageUrl: p.images[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    categorySlug: p.category.slug,
    farmName: p.petani.farmName,
    farmLocation: p.petani.location
  }))

  const catalogCategories: CategoryData[] = categoriesDb.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug
  }))

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <CustomerHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="p-2.5 bg-white rounded-full border border-[#E7E8EC] text-gray-500 hover:text-[#006E2F] hover:bg-[#E6EEFF] transition-colors shadow-sm">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Katalog Panen</h1>
            <p className="text-gray-500 mt-1 text-sm">Dukung petani lokal dengan membeli hasil panen segar langsung dari kebun.</p>
          </div>
        </div>

        {/* Client Component for filtering & rendering */}
        <ProdukListClient products={catalogProducts} categories={catalogCategories} />
      </main>

      <Footer />
    </div>
  )
}
