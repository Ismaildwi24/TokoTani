'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, MapPinIcon } from '@heroicons/react/24/outline'

export type CatalogProductData = {
  id: string
  name: string
  price: number
  unit: string
  stock: number
  isOrganic: boolean
  isPesticideFree: boolean
  imageUrl: string
  categorySlug: string
  farmName: string
  farmLocation: string
}

export type CategoryData = {
  id: string
  name: string
  slug: string
}

interface ProdukListClientProps {
  products: CatalogProductData[]
  categories: CategoryData[]
}

export default function ProdukListClient({ products, categories }: ProdukListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('SEMUA')

  // Filter products based on search and category
  const filteredProducts = products.filter((p) => {
    const matchCategory = activeCategory === 'SEMUA' || p.categorySlug === activeCategory
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.farmName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari sayur, buah, atau nama toko..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E7E8EC] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006E2F] focus:border-transparent transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <button className="flex-shrink-0 p-3 bg-white border border-[#E7E8EC] rounded-2xl text-gray-500 hover:text-[#006E2F] hover:bg-[#E6EEFF] transition-colors shadow-sm">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2">
        <button
          onClick={() => setActiveCategory('SEMUA')}
          className={`whitespace-nowrap px-5 py-2.5 text-sm font-semibold rounded-full transition-all ${
            activeCategory === 'SEMUA'
              ? 'bg-[#006E2F] text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-[#E7E8EC] shadow-sm'
          }`}
        >
          Semua Kategori
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`whitespace-nowrap px-5 py-2.5 text-sm font-semibold rounded-full transition-all ${
              activeCategory === cat.slug
                ? 'bg-[#006E2F] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-[#E7E8EC] shadow-sm'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E7E8EC] p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">Produk Tidak Ditemukan</h3>
          <p className="text-gray-500">Coba ubah kata kunci pencarian atau pilih kategori yang berbeda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((p) => (
            <Link key={p.id} href={`/produk/${p.id}`} className="group bg-white rounded-2xl border border-[#E7E8EC] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              {/* Image Section */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  {p.isOrganic && (
                    <span className="bg-[#22C55E] text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-sm">
                      ORGANIK
                    </span>
                  )}
                  {p.isPesticideFree && (
                    <span className="bg-[#EAB308] text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-sm">
                      BEBAS PESTISIDA
                    </span>
                  )}
                </div>

                {/* Stock Indicator */}
                {p.stock <= 5 && p.stock > 0 && (
                  <div className="absolute bottom-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    Sisa {p.stock}
                  </div>
                )}
                {p.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-white text-gray-900 font-extrabold px-4 py-2 rounded-xl shadow-lg">HABIS</span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-4 flex flex-col flex-grow">
                <div className="mb-auto">
                  <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-[#006E2F] transition-colors">{p.name}</h3>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="font-extrabold text-[#006E2F] text-lg">{formatRupiah(p.price)}</span>
                    <span className="text-xs text-gray-500 mb-1">/{p.unit}</span>
                  </div>
                </div>
                
                <div className="border-t border-[#E7E8EC] pt-3 mt-3 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#E6EEFF] flex items-center justify-center flex-shrink-0 text-[10px]">
                    🧑‍🌾
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-gray-700 truncate">{p.farmName}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-0.5 truncate">
                      <MapPinIcon className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{p.farmLocation}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
