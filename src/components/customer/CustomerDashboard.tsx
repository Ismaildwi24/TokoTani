'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronRightIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { TrophyIcon } from '@heroicons/react/24/solid'

interface Product {
  id: string
  name: string
  price: number | string
  unit: string
  isOrganic: boolean
  isPesticideFree: boolean
  isFeatured: boolean
  images: { url: string }[]
  petani: { farmName: string; location: string }
  category: { name: string; slug: string }
  _count: { reviews: number; orderItems: number }
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Props {
  products: Product[]
  categories: Category[]
  query?: string
  activeCategory?: string
}

function formatRupiah(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

function ProductCard({ product }: { product: Product }) {
  const imgUrl = product.images[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'

  async function addToCart() {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
      
      if (res.status === 401) {
        window.location.href = '/login'
        return
      }

      const data = await res.json()
      if (res.ok) {
        alert('Produk berhasil ditambahkan ke keranjang!')
      } else {
        alert(data.error || 'Gagal menambahkan ke keranjang')
      }
    } catch (err) {
      alert('Terjadi kesalahan')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
      {/* Image */}
      <Link href={`/produk/${product.id}`}>
        <div className="relative h-44 overflow-hidden">
          <img
            src={imgUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
            {product.isOrganic && (
              <span className="bg-[#03682C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                Organik
              </span>
            )}
            {product.isPesticideFree && (
              <span className="bg-[#9E4036] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                Bebas Pestisida
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3.5">
        {/* Farmer */}
        <div className="flex items-center gap-1.5 mb-1">
          <div className="h-5 w-5 rounded-full bg-[#E6EEFF] flex items-center justify-center text-[10px] font-bold text-[#006E2F]">
            {product.petani.farmName[0]}
          </div>
          <span className="text-[11px] text-[#8F9093] truncate">
            Ditanam oleh {product.petani.farmName}, {product.petani.location.split(',')[0]}
          </span>
        </div>

        <Link href={`/produk/${product.id}`}>
          <h3 className="font-semibold text-sm text-gray-900 mb-1.5 line-clamp-2 hover:text-[#006E2F] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="text-[#22C55E] font-bold text-sm mb-3">
          {formatRupiah(product.price)}{' '}
          <span className="text-[#8F9093] font-normal text-xs">/ {product.unit}</span>
        </div>

        <button
          id={`add-to-cart-${product.id}`}
          onClick={(e) => {
            e.preventDefault()
            addToCart()
          }}
          className="w-full py-2 bg-[#22C55E] hover:bg-[#16a34a] text-white text-sm font-semibold rounded-full transition-colors active:scale-95"
        >
          Beli
        </button>
      </div>
    </div>
  )
}

export default function CustomerDashboard({ products, categories, query, activeCategory }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')

  const allCategories = [{ id: 'semua', name: 'Semua', slug: 'semua' }, ...categories]

  function handleCategoryClick(slug: string) {
    const params = new URLSearchParams()
    if (slug !== 'semua') params.set('kategori', slug)
    if (query) params.set('q', query)
    router.push(`/?${params.toString()}`)
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          className="relative rounded-2xl overflow-hidden h-64 sm:h-80"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          <div className="absolute bottom-8 left-8 text-white max-w-sm">
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2">
              Sayur Segar Langsung dari Petani Lokal
            </h1>
            <p className="text-sm text-white/80 mb-5">
              Dukung ketahanan pangan nasional dengan membeli langsung hasil panen terbaik dari pahlawan pangan kita.
            </p>
            <Link
              href="#produk"
              className="inline-flex items-center gap-2 bg-[#22C55E] hover:bg-[#16a34a] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              Belanja Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {allCategories.map((cat) => {
            const isActive = (activeCategory || 'semua') === cat.slug
            return (
              <button
                key={cat.id}
                id={`cat-${cat.slug}`}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                  isActive
                    ? 'bg-[#006E2F] text-white border-[#006E2F]'
                    : 'bg-white text-gray-700 border-[#E7E8EC] hover:border-[#22C55E] hover:text-[#006E2F]'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
      </section>

      {/* Products */}
      <section id="produk" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Terlaris Minggu Ini</h2>
            <p className="text-sm text-[#8F9093] mt-0.5">
              Produk pilihan yang paling banyak dicari tetangga Anda.
            </p>
          </div>
          <Link
            href="/produk"
            className="flex items-center gap-1 text-sm font-semibold text-[#006E2F] hover:underline"
          >
            Lihat Semua <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-[#8F9093]">
            <p className="text-lg font-medium">Produk tidak ditemukan.</p>
            <p className="text-sm mt-1">Coba cari dengan kata kunci lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter CTA — Berlangganan Box Mingguan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-[#E6EEFF] rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between p-8 gap-6">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrophyIcon className="h-6 w-6 text-[#006E2F]" />
                <h2 className="text-2xl font-extrabold text-[#006E2F]">Berlangganan Box Mingguan</h2>
              </div>
              <p className="text-sm text-gray-700 mb-5">
                Dapatkan paket sayur dan buah pilihan langsung ke depan pintu Anda setiap Senin pagi.
                Lebih hemat 15% dari harga pasar.
              </p>
              <form
                onSubmit={(e) => { e.preventDefault(); router.push('/register') }}
                className="flex gap-2"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Alamat email Anda"
                  className="flex-1 px-4 py-2.5 rounded-full border border-[#E7E8EC] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#006E2F] hover:bg-[#005525] text-white text-sm font-semibold rounded-full transition-colors"
                >
                  Daftar Sekarang
                </button>
              </form>
            </div>
            <div className="flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80"
                alt="Kotak sayur segar"
                className="w-60 h-48 object-cover rounded-2xl shadow-md"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
