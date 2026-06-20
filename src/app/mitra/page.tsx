import { Metadata } from 'next'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import {
  ChatBubbleOvalLeftEllipsisIcon,
  BellIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'

export const metadata: Metadata = { title: 'Dashboard Mitra — Toko Tani' }

function formatRupiah(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

export default async function MitraDashboardPage() {
  const user = await requireAuth([UserRole.PETANI])

  const petani = await prisma.petaniProfile.findUnique({
    where: { userId: user.id },
    include: {
      ledgerEntries: { select: { amount: true } },
      products: {
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } }
        }
      },
      orderSellers: {
        where: { status: { in: ['DIPROSES', 'MENUNGGU_PEMBAYARAN'] } },
        include: {
          order: {
            select: {
              customer: { select: { fullName: true } },
              createdAt: true,
            },
          },
          items: { select: { subtotal: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  const saldo = petani?.ledgerEntries.reduce(
    (sum, e) => sum + parseFloat(e.amount as unknown as string),
    0
  ) ?? 0

  const pesananCount = await prisma.orderSeller.count({
    where: {
      petaniId: user.id,
      status: { in: ['DIPROSES', 'MENUNGGU_PEMBAYARAN'] },
    },
  })

  const isVerified = petani?.verificationStatus === 'ACTIVE'

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/mitra" className="flex items-center gap-1.5 text-lg font-extrabold text-[#006E2F]">
              <img src="/logo.png" alt="Logo Toko Tani" className="h-6 w-auto object-contain" />
              Toko Tani
            </Link>
            <nav className="hidden sm:flex items-center gap-5">
              <Link href="/mitra" className="text-sm font-semibold text-[#006E2F] border-b-2 border-[#006E2F] pb-0.5">
                Beranda
              </Link>
              <Link href="/mitra/pesanan" className="text-sm text-gray-600 hover:text-[#006E2F] transition-colors">
                Riwayat Pesanan
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/mitra/chat" className="relative p-2 text-gray-500 hover:text-[#006E2F] rounded-full hover:bg-[#E6EEFF] transition-all">
              <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" />
              <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-red-500 rounded-full" />
            </Link>
            <Link href="/mitra/notifikasi" className="relative p-2 text-gray-500 hover:text-[#006E2F] rounded-full hover:bg-[#E6EEFF] transition-all">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-red-500 rounded-full" />
            </Link>
            <Link href="/mitra/profil/edit" className="flex-shrink-0">
              <div className="h-9 w-9 rounded-full bg-[#006E2F] flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.fullName[0]
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Verification Warning */}
        {!isVerified && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
            <strong>⏳ Akun Anda sedang dalam proses verifikasi.</strong> Setelah diverifikasi oleh Admin, Anda bisa mulai upload produk.
          </div>
        )}

        {/* Greeting & Saldo */}
        <div className="mb-8">
          <p className="text-sm text-[#8F9093] mb-1">Halo, {user.fullName.split(' ')[0]}</p>
          <p className="text-xs text-[#8F9093] uppercase tracking-wide mb-1">Total Saldo</p>
          <h1 className="text-4xl font-extrabold text-gray-900">{formatRupiah(saldo)}</h1>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <Link
            href="/mitra/produk/baru"
            id="upload-panen-btn"
            className={`flex items-center gap-3 p-5 rounded-2xl font-semibold transition-all ${
              isVerified
                ? 'bg-[#22C55E] hover:bg-[#16a34a] text-white shadow-sm hover:shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
            }`}
          >
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              🌾
            </div>
            <span>Upload Panen Baru→</span>
          </Link>

          <Link
            href="/mitra/tarik-dana"
            id="tarik-dana-btn"
            className="flex items-center gap-3 p-5 rounded-2xl border-2 border-[#22C55E] text-[#006E2F] font-semibold hover:bg-[#006E2F] hover:text-white hover:border-[#006E2F] transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-[#E6EEFF] flex items-center justify-center">
              💸
            </div>
            <span>Tarik Dana→</span>
          </Link>
        </div>

        {/* My Products */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-gray-900">Produk Saya (Terbaru)</h2>
            <Link
              href="/mitra/produk"
              className="text-sm font-semibold text-[#006E2F] hover:underline"
            >
              Kelola Produk →
            </Link>
          </div>

          {!petani?.products || petani.products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E7E8EC] p-10 text-center text-[#8F9093]">
              Belum ada produk yang di-upload.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {petani.products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-[#E7E8EC] overflow-hidden hover:shadow-md transition-all group"
                >
                  <div className="h-32 overflow-hidden bg-gray-50 relative">
                    <img
                      src={p.images[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {!p.isActive && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">Nonaktif</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-[#8F9093] mb-0.5">Stok: {p.stock} {p.unit}</p>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">{p.name}</h3>
                    <p className="text-[#22C55E] font-bold text-sm">{formatRupiah(parseFloat(p.price as any))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Orders */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-extrabold text-gray-900">Pesanan Aktif</h2>
            {pesananCount > 0 && (
              <span className="bg-[#22C55E] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {pesananCount} Pesanan Baru
              </span>
            )}
          </div>

          {petani?.orderSellers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E7E8EC] p-10 text-center text-[#8F9093]">
              Belum ada pesanan aktif.
            </div>
          ) : (
            <div className="space-y-3">
              {petani?.orderSellers.map((os) => {
                const total = os.items.reduce(
                  (sum, item) => sum + parseFloat(item.subtotal as unknown as string),
                  0
                )
                const createdAt = new Date(os.order.createdAt)
                const now = new Date()
                const isToday = createdAt.toDateString() === now.toDateString()
                const timeStr = isToday
                  ? `Hari ini, ${createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                  : `Kemarin, ${createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`

                return (
                  <div
                    key={os.id}
                    className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <h3 className="font-bold text-gray-900">{os.order.customer.fullName}</h3>
                      <p className="text-xs text-[#8F9093] flex items-center gap-1 mt-0.5">
                        <TruckIcon className="h-3 w-3" />
                        {timeStr}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-gray-900">{formatRupiah(total)}</span>
                      <Link
                        href={`/mitra/pesanan/${os.id}`}
                        id={`proses-pesanan-${os.id}`}
                        className="px-4 py-2 bg-[#006E2F] hover:bg-[#005525] text-white text-sm font-semibold rounded-full transition-colors"
                      >
                        Proses Pesanan
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {petani && petani.orderSellers.length > 0 && (
            <div className="text-center mt-5">
              <Link
                href="/mitra/pesanan"
                className="text-sm font-semibold text-[#006E2F] hover:underline"
              >
                Lihat Semua Pesanan →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E7E8EC] py-5 px-8 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8F9093]">
          <span>© 2026 Toko Tani Ecosystem. Memberdayakan Petani Lokal.</span>
          <nav className="flex gap-5">
            <Link href="/tentang" className="hover:text-[#006E2F]">Tentang Kami</Link>
            <Link href="/bantuan" className="hover:text-[#006E2F]">Pusat Bantuan</Link>
            <Link href="/privasi" className="hover:text-[#006E2F]">Privasi</Link>
            <Link href="/syarat" className="hover:text-[#006E2F]">Syarat & Ketentuan</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
