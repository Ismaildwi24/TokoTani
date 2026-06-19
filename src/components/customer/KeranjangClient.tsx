'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  TrashIcon,
  BuildingLibraryIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'

function formatRupiah(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

interface CartItemData {
  id: string
  quantity: number
  selected: boolean
  product: {
    id: string
    name: string
    price: number | string
    unit: string
    stock: number
    images: { url: string }[]
    petani: { farmName: string }
  }
}

const PAYMENT_OPTIONS = [
  { id: 'BCA', label: 'Transfer BCA', icon: 'bank' },
  { id: 'BRI', label: 'Transfer BRI', icon: 'bank' },
  { id: 'MANDIRI', label: 'Transfer Mandiri', icon: 'bank' },
  { id: 'BNI', label: 'Transfer BNI', icon: 'bank' },
  { id: 'QRIS', label: 'QRIS', icon: 'qr' },
]

export default function KeranjangClient({ items: initialItems }: { items: CartItemData[] }) {
  const router = useRouter()
  const [items, setItems] = useState<CartItemData[]>(initialItems)
  const [paymentMethod, setPaymentMethod] = useState('BCA')
  const [checkingOut, setCheckingOut] = useState(false)

  const selectedItems = useMemo(() => items.filter((i) => i.selected), [items])

  const subtotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + parseFloat(item.product.price as unknown as string) * item.quantity,
        0
      ),
    [selectedItems]
  )

  function toggleAll(checked: boolean) {
    setItems((prev) => prev.map((i) => ({ ...i, selected: checked })))
  }

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    )
  }

  async function updateQty(id: string, qty: number) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
    )
    await fetch('/api/cart/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: id, quantity: qty }),
    })
  }

  async function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await fetch('/api/cart/remove', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: id }),
    })
  }

  async function handleCheckout() {
    if (selectedItems.length === 0) return
    setCheckingOut(true)
    try {
      const res = await fetch('/api/order/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemIds: selectedItems.map((i) => i.id),
          paymentMethod: paymentMethod === 'QRIS' ? 'MIDTRANS' : 'MANUAL_TRANSFER',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.snapToken) {
          // Midtrans Snap
          // @ts-ignore
          window.snap?.pay(data.snapToken)
        } else {
          router.push(`/pesanan/${data.orderId}`)
        }
      } else {
        alert(data.error || 'Terjadi kesalahan saat membuat pesanan.')
      }
    } catch {
      alert('Terjadi kesalahan jaringan.')
    } finally {
      setCheckingOut(false)
    }
  }

  const allSelected = items.length > 0 && items.every((i) => i.selected)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#006E2F] mb-6 transition-colors">
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali Belanja
      </Link>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Keranjang Belanja</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E8EC] p-12 text-center">
          <p className="text-[#8F9093] mb-4">Keranjang belanja Anda kosong.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#22C55E] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-[#16a34a] transition-colors"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {/* Select All */}
            <div className="bg-white rounded-2xl border border-[#E7E8EC] px-5 py-3 flex items-center gap-3">
              <button
                id="select-all-btn"
                onClick={() => toggleAll(!allSelected)}
                className={`h-5 w-5 rounded flex items-center justify-center border-2 transition-all ${
                  allSelected
                    ? 'bg-[#22C55E] border-[#22C55E]'
                    : 'border-[#E7E8EC] hover:border-[#22C55E]'
                }`}
              >
                {allSelected && <CheckIcon className="h-3 w-3 text-white" />}
              </button>
              <span className="text-sm font-semibold text-gray-700">Pilih Semua</span>
            </div>

            {/* Cart Items */}
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all ${
                  item.selected ? 'border-[#22C55E]/30 bg-green-50/20' : 'border-[#E7E8EC]'
                } p-4`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button
                    id={`cart-item-select-${item.id}`}
                    onClick={() => toggleItem(item.id)}
                    className={`flex-shrink-0 h-5 w-5 rounded flex items-center justify-center border-2 transition-all ${
                      item.selected
                        ? 'bg-[#22C55E] border-[#22C55E]'
                        : 'border-[#E7E8EC] hover:border-[#22C55E]'
                    }`}
                  >
                    {item.selected && <CheckIcon className="h-3 w-3 text-white" />}
                  </button>

                  {/* Image */}
                  <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                    <img
                      src={item.product.images[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#8F9093] mb-0.5 flex items-center gap-1">
                      <BuildingLibraryIcon className="h-3 w-3" />
                      {item.product.petani.farmName}
                    </p>
                    <h3 className={`font-semibold text-sm ${item.selected ? 'text-gray-900' : 'text-gray-400'} truncate`}>
                      {item.product.name}
                    </h3>
                    <p className={`font-bold text-sm mt-0.5 ${item.selected ? 'text-gray-900' : 'text-gray-400'}`}>
                      {formatRupiah(parseFloat(item.product.price as unknown as string) * item.quantity)}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    id={`cart-item-remove-${item.id}`}
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>

                  {/* Qty */}
                  <div className="flex items-center gap-2 border border-[#E7E8EC] rounded-full px-2 py-1">
                    <button
                      id={`cart-qty-minus-${item.id}`}
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-600 font-bold"
                    >
                      −
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                    <button
                      id={`cart-qty-plus-${item.id}`}
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-600 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar — Summary & Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#E7E8EC] p-5 sticky top-20">
              <h2 className="font-extrabold text-gray-900 mb-4">Ringkasan Belanja</h2>

              {/* Payment Methods */}
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Metode Pembayaran</h3>
              <div className="space-y-2 mb-5">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    id={`payment-${opt.id}`}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === opt.id
                        ? 'border-[#22C55E] bg-green-50'
                        : 'border-[#E7E8EC] hover:border-gray-300'
                    }`}
                  >
                    {opt.icon === 'qr' ? (
                      <QrCodeIcon className="h-5 w-5 text-[#8F9093]" />
                    ) : (
                      <BuildingLibraryIcon className="h-5 w-5 text-[#8F9093]" />
                    )}
                    <span className="text-sm font-medium text-gray-700 flex-1 text-left">
                      {opt.label}
                    </span>
                    <div
                      className={`h-4 w-4 rounded-full border-2 transition-all ${
                        paymentMethod === opt.id
                          ? 'border-[#22C55E] bg-[#22C55E]'
                          : 'border-[#E7E8EC]'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="border-t border-[#E7E8EC] pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total Harga ({selectedItems.length} barang)</span>
                  <span className="font-semibold">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900">
                  <span>Total Tagihan</span>
                  <span className="text-[#22C55E]">{formatRupiah(subtotal)}</span>
                </div>
              </div>

              <button
                id="checkout-btn"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0 || checkingOut}
                className="w-full py-3.5 bg-[#006E2F] hover:bg-[#005525] disabled:opacity-50 text-white font-bold rounded-full transition-colors active:scale-95"
              >
                {checkingOut ? 'Memproses...' : `Beli (${selectedItems.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
