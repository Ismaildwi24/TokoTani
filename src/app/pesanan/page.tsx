import { requireAuth } from '@/lib/auth-guard'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import RiwayatPesananCustomerClient, { CustomerOrderData } from '@/components/customer/RiwayatPesananCustomerClient'
import CustomerHeader from '@/components/ui/CustomerHeader'
import Footer from '@/components/ui/Footer'
import { syncOrderPaymentStatus } from '@/lib/syncMidtrans'

export const metadata: Metadata = {
  title: 'Riwayat Pesanan Saya | Toko Tani',
}

export default async function PesananCustomerPage() {
  const user = await requireAuth([UserRole.CUSTOMER])

  // Cari order yang PENDING dan punya midtransOrderId untuk disinkronisasi
  const pendingOrders = await prisma.order.findMany({
    where: { 
      customerId: user.id, 
      paymentStatus: 'PENDING',
      midtransOrderId: { not: null }
    }
  })

  // Sinkronisasi status dengan Midtrans secara paralel
  if (pendingOrders.length > 0) {
    await Promise.all(pendingOrders.map(o => syncOrderPaymentStatus(o.id)))
  }

  // Ambil semua pesanan untuk customer ini, dikelompokkan per penjual (OrderSeller)
  const orderSellers = await prisma.orderSeller.findMany({
    where: { 
      order: { customerId: user.id } 
    },
    include: {
      order: {
        select: {
          orderCode: true,
          createdAt: true,
        }
      },
      petani: {
        select: {
          farmName: true
        }
      },
      items: {
        include: {
          product: {
            include: {
              images: {
                take: 1,
                orderBy: { sortOrder: 'asc' }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Format data untuk client
  const formattedOrders: CustomerOrderData[] = orderSellers.map(os => {
    // Hitung total harga barang + ongkir
    const itemsTotal = os.items.reduce((sum, item) => sum + Number(item.subtotal), 0)
    const totalSeller = itemsTotal + Number(os.shippingCost)

    return {
      id: os.id,
      orderId: os.orderId,
      orderCode: os.order.orderCode,
      status: os.status,
      createdAt: os.order.createdAt.toISOString(),
      farmName: os.petani.farmName,
      totalSeller,
      items: os.items.map(item => ({
        id: item.id,
        productNameSnapshot: item.productNameSnapshot,
        quantity: item.quantity,
        priceSnapshot: Number(item.priceSnapshot),
        subtotal: Number(item.subtotal),
        imageUrl: item.product.images[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'
      }))
    }
  })

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <CustomerHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/profil" className="p-2 bg-white rounded-full border border-[#E7E8EC] text-gray-500 hover:text-[#006E2F] transition-colors">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Riwayat Pesanan</h1>
            <p className="text-gray-500 mt-1 text-sm">Lacak dan pantau status seluruh belanjaan Anda.</p>
          </div>
        </div>

        <RiwayatPesananCustomerClient orders={formattedOrders} />
      </main>

      <Footer />
    </div>
  )
}
