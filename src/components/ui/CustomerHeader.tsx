'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  MagnifyingGlassIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  BellIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline'

interface CustomerHeaderProps {
  cartCount?: number
  notifCount?: number
  avatarUrl?: string | null
  searchDefault?: string
}

export default function CustomerHeader({
  cartCount = 0,
  notifCount = 0,
  avatarUrl,
  searchDefault = '',
}: CustomerHeaderProps) {
  const router = useRouter()
  const [search, setSearch] = useState(searchDefault)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/?q=${encodeURIComponent(search.trim())}`)
    }
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
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8F9093]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari sayur, buah, atau bumbu segar..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E7E8EC] bg-[#F8F9FF] text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all"
            />
          </div>
        </form>

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

          {/* Notif */}
          <Link
            href="/notifikasi"
            id="header-notif-btn"
            className="relative p-2 text-gray-600 hover:text-[#006E2F] hover:bg-[#E6EEFF] rounded-full transition-all"
          >
            <BellIcon className="h-5 w-5" />
            {notifCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
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
