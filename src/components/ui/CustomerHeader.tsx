'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  MagnifyingGlassIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline'

interface CustomerHeaderProps {
  cartCount?: number
  notifCount?: number
  avatarUrl?: string | null
  searchDefault?: string
}

interface SearchResult {
  id: string
  name: string
  price: string
  unit: string
  petani: { farmName: string }
  images: { url: string }[]
}

export default function CustomerHeader({
  cartCount = 0,
  notifCount = 0,
  avatarUrl,
  searchDefault = '',
}: CustomerHeaderProps) {
  const router = useRouter()
  const [search, setSearch] = useState(searchDefault)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchResults = async () => {
      if (!search.trim()) {
        setResults([])
        setShowDropdown(false)
        return
      }
      setIsSearching(true)
      try {
        const res = await fetch(`/api/product/search?q=${encodeURIComponent(search.trim())}`)
        const data = await res.json()
        if (data.products) {
          setResults(data.products)
          setShowDropdown(true)
        }
      } catch (e) {
        console.error('Search failed', e)
      } finally {
        setIsSearching(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchResults()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/?q=${encodeURIComponent(search.trim())}`)
      setShowDropdown(false)
    }
  }

  function handleSelectResult(id: string) {
    setShowDropdown(false)
    setSearch('')
    router.push(`/produk/${id}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E7E8EC] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0 flex items-center gap-2 text-xl font-extrabold text-[#006E2F] tracking-tight hover:opacity-80 transition-opacity"
        >
          <img src="/logo.png" alt="Logo Toko Tani" className="h-8 w-auto object-contain" />
          Toko Tani
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto relative" ref={dropdownRef}>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8F9093]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                  if (search.trim() && results.length > 0) setShowDropdown(true)
                }}
                placeholder="Cari sayur, buah, atau bumbu segar..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E7E8EC] bg-[#F8F9FF] text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
              />
            </div>
          </form>
          
          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#E7E8EC] overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-gray-500">Mencari...</div>
              ) : results.length > 0 ? (
                <ul className="max-h-80 overflow-y-auto divide-y divide-[#E7E8EC]">
                  {results.map((product) => (
                    <li key={product.id}>
                      <button
                        onClick={() => handleSelectResult(product.id)}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#F8F9FF] transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.images[0] ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-[#8F9093] mt-0.5 truncate">🌾 {product.petani.farmName}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#22C55E]">Rp {new Intl.NumberFormat('id-ID').format(Number(product.price))}</p>
                          <p className="text-xs text-gray-500">/ {product.unit}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">Produk tidak ditemukan</div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Chat */}
          <Link
            href="/chat"
            id="header-chat-btn"
            className="relative p-2 text-gray-600 hover:text-[#006E2F] hover:bg-[#E6EEFF] rounded-full transition-all"
          >
            <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" />
          </Link>


          {/* Cart */}
          <Link
            href="/keranjang"
            id="header-cart-btn"
            className="relative p-2 text-gray-600 hover:text-[#006E2F] hover:bg-[#E6EEFF] rounded-full transition-all"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Avatar */}
          <Link
            href="/profil"
            id="header-profile-btn"
            className="flex-shrink-0"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profil"
                className="h-8 w-8 rounded-full object-cover border-2 border-[#E7E8EC] hover:border-[#22C55E] transition-all"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#006E2F] flex items-center justify-center text-white text-sm font-semibold hover:opacity-80 transition-opacity">
                U
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
