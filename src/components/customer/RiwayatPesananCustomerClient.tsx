'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { TruckIcon, ClockIcon, CheckCircleIcon, XCircleIcon, InboxIcon, StarIcon } from '@heroicons/react/24/outline'

type OrderStatus = 'MENUNGGU_PEMBAYARAN' | 'DIPROSES' | 'DIKIRIM' | 'SELESAI' | 'DIBATALKAN'

type OrderItemData = {
  id: string
  productNameSnapshot: string
  quantity: number
  priceSnapshot: number
  subtotal: number
  imageUrl: string
}

export type CustomerOrderData = {
  id: string
  orderId: string
  orderCode: string
  status: OrderStatus
  createdAt: string
  farmName: string
  items: OrderItemData[]
  totalSeller: number
}

interface RiwayatPesananCustomerClientProps {
  orders: CustomerOrderData[]
}

const TABS: { label: string; value: OrderStatus | 'SEMUA' }[] = [
  { label: 'Semua', value: 'SEMUA' },
  { label: 'Menunggu', value: 'MENUNGGU_PEMBAYARAN' },
  { label: 'Diproses', value: 'DIPROSES' },
  { label: 'Dikirim', value: 'DIKIRIM' },
  { label: 'Selesai', value: 'SELESAI' },
  { label: 'Dibatalkan', value: 'DIBATALKAN' },
]

export default function RiwayatPesananCustomerClient({ orders }: RiwayatPesananCustomerClientProps) {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') as OrderStatus | 'SEMUA' || 'SEMUA'
  const [activeTab, setActiveTab] = useState<OrderStatus | 'SEMUA'>('SEMUA')

  useEffect(() => {
    if (TABS.some(t => t.value === initialStatus)) {
      setActiveTab(initialStatus)
    }
  }, [initialStatus])

  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const handleCancel = async (orderId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return
    
    setCancelingId(orderId)
    try {
      const res = await fetch(`/api/order/${orderId}/cancel`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json()
        alert(body.error || 'Gagal membatalkan pesanan')
      } else {
        window.location.reload()
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan')
    } finally {
      setCancelingId(null)
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'SEMUA') return true
    return order.status === activeTab
  })

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'MENUNGGU_PEMBAYARAN':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><ClockIcon className="w-3 h-3" /> Menunggu Pembayaran</span>
      case 'DIPROSES':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><InboxIcon className="w-3 h-3" /> Diproses Penjual</span>
      case 'DIKIRIM':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><TruckIcon className="w-3 h-3" /> Sedang Dikirim</span>
      case 'SELESAI':
        return <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Selesai</span>
      case 'DIBATALKAN':
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><XCircleIcon className="w-3 h-3" /> Dibatalkan</span>
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2 border-b border-[#E7E8EC]">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
              activeTab === tab.value
                ? 'bg-[#006E2F] text-white'
                : 'bg-white text-gray-500 hover:bg-gray-100 border border-[#E7E8EC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E8EC] p-12 text-center text-[#8F9093]">
            <InboxIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada pesanan di kategori ini.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const firstItem = order.items[0]
            const remainingCount = order.items.length - 1

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-[#E7E8EC] bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-gray-500 font-medium">{new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">{order.orderCode}</span>
                  </div>
                  <div className="text-xs font-bold text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-[#E7E8EC]">
                    Toko: {order.farmName}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                      <img src={firstItem.imageUrl} alt={firstItem.productNameSnapshot} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-gray-900 line-clamp-1">{firstItem.productNameSnapshot}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {firstItem.quantity} x {formatRupiah(firstItem.priceSnapshot)}
                      </p>
                      {remainingCount > 0 && (
                        <p className="text-xs text-gray-500 mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded-md">
                          +{remainingCount} produk lainnya
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-[#E7E8EC] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Belanja</p>
                    <p className="font-extrabold text-[#006E2F] text-lg">{formatRupiah(order.totalSeller)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === 'MENUNGGU_PEMBAYARAN' && (
                      <>
                        <button
                          onClick={() => handleCancel(order.orderId)}
                          disabled={cancelingId === order.orderId}
                          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                        >
                          {cancelingId === order.orderId ? 'Memproses...' : 'Batalkan Pesanan'}
                        </button>
                        <Link
                          href={`/pesanan/${order.orderId}`}
                          className="px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-xl text-sm font-bold transition-colors"
                        >
                          Bayar Sekarang
                        </Link>
                      </>
                    )}
                    {order.status === 'SELESAI' && (
                      <Link
                        href={`/pesanan/${order.orderId}`}
                        className="px-4 py-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-xl text-sm font-bold transition-colors flex items-center gap-1"
                      >
                        <StarIcon className="w-4 h-4" /> Beri Ulasan
                      </Link>
                    )}
                    {order.status !== 'MENUNGGU_PEMBAYARAN' && order.status !== 'SELESAI' && (
                      <Link
                        href={`/pesanan/${order.orderId}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-bold transition-colors"
                      >
                        Lihat Detail
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
