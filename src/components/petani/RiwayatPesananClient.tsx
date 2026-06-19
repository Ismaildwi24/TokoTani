'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TruckIcon, ClockIcon, CheckCircleIcon, XCircleIcon, InboxIcon } from '@heroicons/react/24/outline'

type OrderStatus = 'MENUNGGU_PEMBAYARAN' | 'DIPROSES' | 'DIKIRIM' | 'SELESAI' | 'DIBATALKAN'

type OrderItemData = {
  id: string
  productNameSnapshot: string
  quantity: number
  subtotal: number
}

export type OrderSellerData = {
  id: string
  status: OrderStatus
  createdAt: string
  customerName: string
  orderCode: string
  items: OrderItemData[]
}

interface RiwayatPesananClientProps {
  orders: OrderSellerData[]
}

const TABS: { label: string; value: OrderStatus | 'SEMUA' }[] = [
  { label: 'Semua', value: 'SEMUA' },
  { label: 'Menunggu', value: 'MENUNGGU_PEMBAYARAN' },
  { label: 'Diproses', value: 'DIPROSES' },
  { label: 'Dikirim', value: 'DIKIRIM' },
  { label: 'Selesai', value: 'SELESAI' },
  { label: 'Dibatalkan', value: 'DIBATALKAN' },
]

export default function RiwayatPesananClient({ orders }: RiwayatPesananClientProps) {
  const [activeTab, setActiveTab] = useState<OrderStatus | 'SEMUA'>('SEMUA')

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'SEMUA') return true
    return order.status === activeTab
  })

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'MENUNGGU_PEMBAYARAN':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><ClockIcon className="w-3 h-3" /> Menunggu</span>
      case 'DIPROSES':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><InboxIcon className="w-3 h-3" /> Diproses</span>
      case 'DIKIRIM':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><TruckIcon className="w-3 h-3" /> Dikirim</span>
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
            <p>Tidak ada pesanan di kategori ini.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0)
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
            
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-[#E7E8EC] bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-gray-500 font-medium">{new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">{order.orderCode}</span>
                  </div>
                </div>

                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg mb-1">{order.customerName}</h3>
                    <p className="text-sm text-gray-600">
                      {itemCount} produk • {order.items.map(i => i.productNameSnapshot).slice(0, 2).join(', ')}
                      {order.items.length > 2 ? ` ... (+${order.items.length - 2} lainnya)` : ''}
                    </p>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-[#E7E8EC] pt-4 md:pt-0 md:pl-5">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Total Pendapatan</p>
                      <p className="font-extrabold text-[#006E2F] text-lg">{formatRupiah(totalAmount)}</p>
                    </div>
                    
                    <Link
                      href={`/mitra/pesanan/${order.id}`}
                      className="px-4 py-2 bg-[#E6EEFF] text-[#006E2F] hover:bg-[#006E2F] hover:text-white rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                    >
                      Lihat Detail
                    </Link>
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
