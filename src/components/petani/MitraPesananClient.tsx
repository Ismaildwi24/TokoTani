'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  MapPinIcon,
  ChatBubbleOvalLeftIcon,
  TruckIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

function formatRupiah(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

const COURIERS = [
  { name: 'Pengiriman Manual', eta: 'Diantar langsung oleh Petani', price: 0 },
]

interface OrderSellerData {
  id: string
  status: string
  courierName: string | null
  shippingCost: number | string
  order: {
    orderCode: string
    customer: { id: string; fullName: string; avatarUrl: string | null }
    shippingAddress: {
      fullAddress: string
      city: string
      province: string
      postalCode: string
    }
  }
  items: Array<{
    id: string
    productNameSnapshot: string
    quantity: number
    priceSnapshot: number | string
    subtotal: number | string
    product: {
      name: string
      isOrganic: boolean
      isPesticideFree: boolean
      unit: string
      images: Array<{ url: string }>
    }
  }>
}

export default function MitraPesananClient({
  orderSeller,
  currentUserId,
}: {
  orderSeller: OrderSellerData
  currentUserId: string
}) {
  const router = useRouter()
  const [selectedCourier, setSelectedCourier] = useState(
    COURIERS.find((c) => c.name === orderSeller.courierName) || null
  )
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(orderSeller.status === 'DIKIRIM' || orderSeller.status === 'SELESAI')

  const itemTotal = orderSeller.items.reduce(
    (sum, item) => sum + parseFloat(item.subtotal as unknown as string),
    0
  )
  const shippingCost = selectedCourier?.price || parseFloat(orderSeller.shippingCost as unknown as string) || 0
  const grandTotal = itemTotal + shippingCost

  async function handleSubmit() {
    if (!selectedCourier || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/order/seller/${orderSeller.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courierName: selectedCourier.name,
          courierEta: selectedCourier.eta,
          shippingCost: selectedCourier.price,
        }),
      })
      if (res.ok) {
        setDone(true)
      }
    } catch {
      // handle
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/mitra" className="text-[#006E2F] hover:opacity-70">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-sm font-extrabold text-[#006E2F]">Detail Pemrosesan Pesanan</h1>
              <p className="text-xs text-[#8F9093]">Order #{orderSeller.order.orderCode}</p>
            </div>
          </div>
          <span className="text-xs text-[#8F9093] border border-[#E7E8EC] px-3 py-1 rounded-full">
            Order ID: #{orderSeller.order.orderCode}
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Customer Info + Product Summary */}
          <div className="space-y-4">
            {/* Customer Card */}
            <div className="bg-white rounded-2xl border border-[#E7E8EC] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900">Informasi Pelanggan</h2>
                <Link
                  href={`/mitra/chat?customerId=${orderSeller.order.customer.id}&orderId=${orderSeller.id}`}
                  id="hubungi-customer-btn"
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#006E2F] hover:underline"
                >
                  <ChatBubbleOvalLeftIcon className="h-4 w-4" />
                  Hubungi {orderSeller.order.customer.fullName.split(' ')[0]}
                </Link>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-[#006E2F] flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                  {orderSeller.order.customer.avatarUrl ? (
                    <img src={orderSeller.order.customer.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    orderSeller.order.customer.fullName[0]
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{orderSeller.order.customer.fullName}</p>
                  <p className="text-xs text-[#8F9093]">
                    {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="bg-[#F8F9FF] rounded-xl p-3">
                <p className="text-xs text-[#8F9093] mb-1 flex items-center gap-1">
                  <MapPinIcon className="h-3.5 w-3.5" />
                  Alamat Pengiriman
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {orderSeller.order.shippingAddress.fullAddress},{' '}
                  {orderSeller.order.shippingAddress.city},{' '}
                  {orderSeller.order.shippingAddress.province} {orderSeller.order.shippingAddress.postalCode}
                </p>
              </div>
            </div>

            {/* Product Summary */}
            <div className="bg-white rounded-2xl border border-[#E7E8EC] p-5">
              <h2 className="font-bold text-gray-900 mb-4">Ringkasan Produk</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E7E8EC] text-xs text-[#8F9093]">
                      <th className="text-left pb-2">Produk</th>
                      <th className="text-center pb-2">Jumlah</th>
                      <th className="text-right pb-2">Harga Satuan</th>
                      <th className="text-right pb-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E8EC]">
                    {orderSeller.items.map((item) => (
                      <tr key={item.id} className="py-3">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                              {item.product.images[0] ? (
                                <img
                                  src={item.product.images[0].url}
                                  alt={item.productNameSnapshot}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.productNameSnapshot}</p>
                              <div className="flex gap-1 mt-0.5">
                                {item.product.isOrganic && (
                                  <span className="text-[10px] text-[#03682C] font-semibold">Organik</span>
                                )}
                                {item.product.isPesticideFree && (
                                  <span className="text-[10px] text-[#9E4036] font-semibold">• Tanpa Pestisida</span>
                                )}
                                <span className="text-[10px] text-[#8F9093]">• {item.product.unit}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center font-medium">{item.quantity}</td>
                        <td className="text-right">{formatRupiah(item.priceSnapshot)}</td>
                        <td className="text-right font-semibold">{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-[#E7E8EC] mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total Barang ({orderSeller.items.length} Item)</span>
                  <span>{formatRupiah(itemTotal)}</span>
                </div>
                {selectedCourier && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Ongkos Kirim ({selectedCourier.name})</span>
                    <span>{formatRupiah(selectedCourier.price)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-[#006E2F] text-lg pt-1 border-t border-[#E7E8EC]">
                  <span>Total Pembayaran</span>
                  <span>{formatRupiah(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Courier Selection */}
          <div>
            <div className="bg-white rounded-2xl border border-[#E7E8EC] p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TruckIcon className="h-5 w-5 text-[#006E2F]" />
                Pilih Kurir Pengiriman
              </h2>

              <div className="space-y-2 mb-5">
                {COURIERS.map((courier) => {
                  const isSelected = selectedCourier?.name === courier.name
                  return (
                    <button
                      key={courier.name}
                      id={`courier-${courier.name.toLowerCase()}`}
                      onClick={() => !done && setSelectedCourier(courier)}
                      disabled={done}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[#22C55E] bg-green-50'
                          : 'border-[#E7E8EC] hover:border-gray-300'
                      } ${done ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-[#22C55E] bg-[#22C55E]' : 'border-[#E7E8EC]'
                            }`}
                          >
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                          <span className="font-semibold text-gray-900">{courier.name}</span>
                        </div>
                        <p className="text-xs text-[#8F9093] mt-0.5 ml-6">{courier.eta}</p>
                      </div>
                      <span className="font-bold text-[#006E2F]">{formatRupiah(courier.price)}</span>
                    </button>
                  )
                })}
              </div>

              {/* Actions */}
              {done ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700 text-sm font-semibold">
                  <CheckCircleIcon className="h-5 w-5" />
                  Pesanan telah diserahkan ke kurir!
                </div>
              ) : (
                <>
                  <button
                    id="serahkan-kurir-btn"
                    onClick={handleSubmit}
                    disabled={!selectedCourier || submitting}
                    className="w-full py-3.5 bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-50 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2 mb-3"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    {submitting ? 'Memproses...' : 'Pesanan Siap, Serahkan ke Kurir'}
                  </button>

                  <Link
                    href="/mitra"
                    className="w-full flex items-center justify-center py-3 border-2 border-[#006E2F] text-[#006E2F] font-semibold rounded-full hover:bg-[#006E2F] hover:text-white transition-colors text-sm"
                  >
                    Kembali
                  </Link>

                  <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2">
                    <InformationCircleIcon className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 leading-relaxed">
                      Pastikan semua produk telah dipacking dengan standar keamanan pangan sebelum diserahkan ke kurir.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-[#8F9093] py-5 border-t border-[#E7E8EC] mt-8">
        © 2026 Toko Tani Ecosystem. Memberdayakan Petani Lokal.
      </footer>
    </div>
  )
}
