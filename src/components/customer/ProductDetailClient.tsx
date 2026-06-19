'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  StarIcon,
  ShoppingCartIcon,
  ChatBubbleOvalLeftIcon,
  ShieldCheckIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

function formatRupiah(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num)
}

interface ProductDetailClientProps {
  product: any
  related: any[]
  avgRating: number
}

export default function ProductDetailClient({ product, related, avgRating }: ProductDetailClientProps) {
  const router = useRouter()
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [addingCart, setAddingCart] = useState(false)
  const [cartMsg, setCartMsg] = useState('')

  const images = product.images?.length
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80' }]

  async function handleAddToCart() {
    setAddingCart(true)
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      })
      if (res.ok) {
        setCartMsg('Berhasil ditambahkan ke keranjang!')
        setTimeout(() => setCartMsg(''), 3000)
      } else {
        const body = await res.json()
        setCartMsg(body.error || 'Gagal menambahkan.')
      }
    } catch {
      setCartMsg('Terjadi kesalahan.')
    } finally {
      setAddingCart(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#006E2F] mb-6 transition-colors">
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali Belanja
      </Link>

      {/* Toast */}
      {cartMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#006E2F] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          {cartMsg}
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div className="rounded-xl overflow-hidden bg-gray-50 h-80 mb-3">
              <img
                src={images[selectedImg]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              {images.map((img: any, i: number) => (
                <button
                  key={i}
                  id={`product-img-thumb-${i}`}
                  onClick={() => setSelectedImg(i)}
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImg === i ? 'border-[#22C55E]' : 'border-[#E7E8EC] hover:border-gray-400'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
            <div className="text-2xl font-bold text-[#22C55E] mb-3">
              {formatRupiah(product.price)}{' '}
              <span className="text-sm font-normal text-[#8F9093]">/ {product.unit}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.isOrganic && (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#03682C] bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                  Organik / Bebas Pestisida
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-[#E7E8EC] px-2.5 py-1 rounded-full">
                <MapPinIcon className="h-3.5 w-3.5" />
                Ditanam oleh {product.petani.farmName} di {product.petani.location}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
                {product.description}
              </p>
            )}

            {/* Qty + Add to Cart */}
            <div className="flex items-center gap-4 mt-auto">
              <div className="flex items-center gap-3 border border-[#E7E8EC] rounded-full px-2 py-1.5">
                <button
                  id="qty-minus"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="font-semibold text-gray-900 w-6 text-center">{qty}</span>
                <button
                  id="qty-plus"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>

              <button
                id="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={addingCart || product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#006E2F] hover:bg-[#005525] disabled:opacity-50 text-white font-semibold rounded-full transition-colors active:scale-95"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {product.stock === 0 ? 'Stok Habis' : 'Tambahkan ke Keranjang'}
              </button>
            </div>

            {/* Chat Petani */}
            <div className="mt-4">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/chat', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ partnerId: product.petani.userId })
                    })
                    if (res.ok) {
                      router.push('/chat')
                    } else {
                      router.push('/login')
                    }
                  } catch (e) {
                    console.error('Failed to start chat')
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#006E2F] text-[#006E2F] hover:bg-green-50 font-semibold rounded-full transition-colors active:scale-95"
              >
                <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                Tanya Petani
              </button>
            </div>

            {/* Stock indicator */}
            <p className="text-xs text-[#8F9093] mt-2">
              Stok tersedia: <span className="font-semibold text-gray-700">{product.stock} {product.unit}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-gray-900">Ulasan Pembeli</h2>
          {avgRating > 0 && (
            <div className="flex items-center gap-1.5 bg-[#006E2F] text-white px-3 py-1.5 rounded-full text-sm font-bold">
              {avgRating.toFixed(1)} / 5
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <StarSolid
                    key={s}
                    className={`h-3 w-3 ${s <= Math.round(avgRating) ? 'text-yellow-300' : 'text-white/40'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {product.reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E8EC] p-8 text-center text-[#8F9093]">
            Belum ada ulasan untuk produk ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.reviews.map((review: any) => (
              <div key={review.id} className="bg-white rounded-2xl border border-[#E7E8EC] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-[#E6EEFF] flex items-center justify-center text-xs font-bold text-[#006E2F]">
                    {review.customer.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{review.customer.fullName}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarSolid
                          key={s}
                          className={`h-3 w-3 ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                )}
                {review.photoUrl && (
                  <img
                    src={review.photoUrl}
                    alt="Foto ulasan"
                    className="mt-2 h-14 w-14 rounded-lg object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">Mungkin Anda juga butuh</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((rel: any) => (
              <Link
                key={rel.id}
                href={`/produk/${rel.id}`}
                className="bg-white rounded-2xl border border-[#E7E8EC] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="h-36 overflow-hidden">
                  <img
                    src={rel.images[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'}
                    alt={rel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-[#8F9093] mb-0.5">{rel.unit}</p>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1.5">{rel.name}</h3>
                  <p className="text-[#22C55E] font-bold text-sm">{formatRupiah(rel.price)}</p>
                  <button className="mt-2 w-full py-1.5 border-2 border-[#006E2F] text-[#006E2F] text-xs font-semibold rounded-full hover:bg-[#006E2F] hover:text-white transition-colors">
                    Beli
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
