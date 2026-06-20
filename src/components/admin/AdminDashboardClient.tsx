'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BellIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'

interface Stat {
  label: string
  value: string
  badge: string
  color: string
}

interface FeaturedProduct {
  id: string
  name: string
  price: number | string
  unit: string
  isFeatured: boolean
  images: Array<{ url: string }>
  petani: { farmName: string }
}

interface OperasionalItem {
  type: 'verify' | 'complaint'
  title: string
  desc: string
  time: string
  id: string
}

interface Props {
  adminName: string
  adminAvatar: string | null
  stats: Stat[]
  featuredProducts: FeaturedProduct[]
  operasional: OperasionalItem[]
}

function formatRupiah(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

export default function AdminDashboardClient({
  adminName,
  adminAvatar,
  stats,
  featuredProducts,
  operasional,
}: Props) {
  const router = useRouter()
  const [products, setProducts] = useState(featuredProducts)
  const [downloading, setDownloading] = useState(false)

  async function toggleFeatured(productId: string) {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p))
    )
    await fetch(`/api/admin/product/${productId}/featured`, { method: 'PATCH' })
  }

  async function downloadReport() {
    setDownloading(true)
    try {
      const res = await fetch('/api/admin/report/export')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-toko-tani-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Selamat Pagi'
    if (h < 15) return 'Selamat Siang'
    if (h < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Admin Header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-1.5 text-lg font-extrabold text-[#006E2F]">
              <img src="/logo.png" alt="Logo Toko Tani" className="h-6 w-auto object-contain" />
              Toko Tani Admin
            </Link>
            <nav className="hidden sm:flex items-center gap-5">
              <Link href="/admin" className="text-sm font-semibold text-[#006E2F] border-b-2 border-[#006E2F] pb-0.5">
                Beranda
              </Link>
              <Link href="/admin/operasional" className="text-sm text-gray-600 hover:text-[#006E2F] transition-colors">
                Operasional
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/notifikasi" className="p-2 text-gray-500 hover:text-[#006E2F] rounded-full hover:bg-[#E6EEFF]">
              <BellIcon className="h-5 w-5" />
            </Link>
            <button
              id="admin-unduh-laporan-btn"
              onClick={downloadReport}
              disabled={downloading}
              className="px-4 py-2 bg-[#006E2F] hover:bg-[#005525] disabled:opacity-50 text-white text-sm font-semibold rounded-full transition-colors"
            >
              {downloading ? 'Mengunduh...' : 'Unduh Laporan'}
            </button>
            <Link href="/admin/profil/edit">
              <div className="h-9 w-9 rounded-full bg-[#006E2F] flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                {adminAvatar ? (
                  <img src={adminAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  adminName[0]
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Halo, {greeting()} {adminName}!
          </h1>
          <p className="text-sm text-[#8F9093] mt-1">
            Berikut ringkasan performa platform Toko Tani hari ini.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-[#E6EEFF] flex items-center justify-center text-lg">
                  {i === 0 ? '💳' : i === 1 ? '🌾' : i === 2 ? '👥' : '💰'}
                </div>
                <span className={`text-xs font-bold ${stat.color} bg-opacity-10 px-2 py-0.5 rounded-full`}>
                  {stat.badge}
                </span>
              </div>
              <p className="text-xs text-[#8F9093] mb-1">{stat.label}</p>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Featured Products Curation */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Kurasi Produk Halaman Depan</h2>
              <p className="text-sm text-[#8F9093] mt-0.5">
                Kelola produk yang tampil sebagai unggulan bagi konsumen.
              </p>
            </div>
            <Link
              href="/admin/produk"
              className="text-sm font-semibold text-[#006E2F] hover:underline flex items-center gap-1"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-[#E7E8EC] overflow-hidden">
                <div className="relative h-36 bg-gray-50">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200" />
                  )}
                  {product.isFeatured && (
                    <div className="absolute top-2 left-2 bg-[#22C55E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Terlaris
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-[#22C55E] font-bold text-xs mb-1.5">
                    {formatRupiah(product.price)} / {product.unit}
                  </p>
                  <p className="text-[11px] text-[#8F9093] mb-3 flex items-center gap-1">
                    🌾 {product.petani.farmName}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Featured</span>
                    <button
                      id={`toggle-featured-${product.id}`}
                      onClick={() => toggleFeatured(product.id)}
                      className={`relative w-10 h-5 rounded-full transition-all ${
                        product.isFeatured ? 'bg-[#22C55E]' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                          product.isFeatured ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operasional Feed */}
        <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-gray-900">Operasional Terkini</h2>
            <Link href="/admin/operasional" className="text-xs text-[#8F9093] hover:text-[#006E2F]">
              Update {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </Link>
          </div>

          {operasional.length === 0 ? (
            <p className="text-sm text-[#8F9093] text-center py-4">Tidak ada item operasional terbaru.</p>
          ) : (
            <div className="divide-y divide-[#E7E8EC]">
              {operasional.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-3.5">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.type === 'verify' ? 'bg-[#E6EEFF]' : 'bg-red-50'
                    }`}
                  >
                    {item.type === 'verify' ? (
                      <CheckCircleIcon className="h-5 w-5 text-[#006E2F]" />
                    ) : (
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-[#8F9093] mt-0.5">{item.desc}</p>
                  </div>
                  <span className="text-xs text-[#8F9093] flex-shrink-0">{item.time} WIB</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-[#8F9093] py-5 border-t border-[#E7E8EC] mt-8">
        © 2026 Toko Tani Indonesia. Hak Cipta Dilindungi. Sistem Manajemen Super Admin v2.4.0
      </footer>
    </div>
  )
}
