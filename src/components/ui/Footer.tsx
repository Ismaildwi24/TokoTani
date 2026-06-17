import Link from 'next/link'
import { GlobeAltIcon, ShareIcon } from '@heroicons/react/24/outline'

export default function Footer() {
  return (
    <footer className="bg-[#F8F9FF] border-t border-[#E7E8EC] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-extrabold text-[#006E2F]">
              Toko Tani
            </Link>
            <p className="text-xs text-[#8F9093] mt-1">
              © 2026 Toko Tani Ecosystem. Memberdayakan Petani Lokal.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
            <Link href="/tentang" className="hover:text-[#006E2F] transition-colors">
              Tentang Kami
            </Link>
            <Link href="/bantuan" className="hover:text-[#006E2F] transition-colors">
              Pusat Bantuan
            </Link>
            <Link href="/privasi" className="hover:text-[#006E2F] transition-colors">
              Privasi
            </Link>
            <Link href="/syarat" className="hover:text-[#006E2F] transition-colors">
              Syarat & Ketentuan
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              id="footer-globe-btn"
              className="p-2 rounded-full border border-[#E7E8EC] text-gray-600 hover:text-[#006E2F] hover:border-[#22C55E] transition-all"
              title="Bahasa"
            >
              <GlobeAltIcon className="h-4 w-4" />
            </button>
            <button
              id="footer-share-btn"
              className="p-2 rounded-full border border-[#E7E8EC] text-gray-600 hover:text-[#006E2F] hover:border-[#22C55E] transition-all"
              title="Bagikan"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
