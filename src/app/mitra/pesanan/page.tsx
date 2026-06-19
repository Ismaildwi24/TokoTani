import { requireAuth } from '@/lib/auth-guard'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import RiwayatPesananClient, { OrderSellerData } from '@/components/petani/RiwayatPesananClient'

export const metadata: Metadata = {
  title: 'Riwayat Pesanan | Toko Tani',
}

export default async function RiwayatPesananPage() {
  const user = await requireAuth([UserRole.PETANI])

  // Ambil semua pesanan untuk petani ini
  const orders = await prisma.orderSeller.findMany({
    where: { petaniId: user.id },
    include: {
      order: {
        select: {
          orderCode: true,
          customer: {
            select: { fullName: true }
          }
        }
      },
      items: {
        select: {
          id: true,
          productNameSnapshot: true,
          quantity: true,
          subtotal: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Format data untuk client
  const formattedOrders: OrderSellerData[] = orders.map(os => ({
    id: os.id,
    status: os.status,
    createdAt: os.createdAt.toISOString(),
    customerName: os.order.customer.fullName,
    orderCode: os.order.orderCode,
    items: os.items.map(item => ({
      id: item.id,
      productNameSnapshot: item.productNameSnapshot,
      quantity: item.quantity,
      subtotal: Number(item.subtotal)
    }))
  }))

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/mitra" className="text-[#006E2F]">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="font-extrabold text-[#006E2F]">Riwayat Pesanan</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Kelola Penjualan Anda</h2>
          <p className="text-gray-500 mt-1 text-sm">Pantau dan kelola seluruh pesanan masuk dari pelanggan.</p>
        </div>

        <RiwayatPesananClient orders={formattedOrders} />
      </main>
    </div>
  )
}
