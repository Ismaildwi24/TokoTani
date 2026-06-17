import { Metadata } from 'next'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import CustomerHeader from '@/components/ui/CustomerHeader'
import Footer from '@/components/ui/Footer'
import { UserRole } from '@prisma/client'
import {
  MapPinIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'

export const metadata: Metadata = { title: 'Profil Saya — Toko Tani' }

const ORDER_STATUS_ICONS: Record<string, string> = {
  MENUNGGU_PEMBAYARAN: '💳',
  DIPROSES: '📦',
  DIKIRIM: '🚚',
  SELESAI: '⭐',
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  MENUNGGU_PEMBAYARAN: 'Menunggu Pembayaran',
  DIPROSES: 'Diproses',
  DIKIRIM: 'Dikirim / Diantar',
  SELESAI: 'Beri Ulasan',
}

export default async function ProfilPage() {
  const user = await requireAuth([UserRole.CUSTOMER])

  const [orderCounts, recentOrders] = await Promise.all([
    prisma.order.groupBy({
      by: ['paymentStatus'],
      where: { customerId: user.id },
      _count: true,
    }),
    prisma.order.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        orderCode: true,
        paymentStatus: true,
        total: true,
        orderSellers: { select: { status: true } },
      },
    }),
  ])

  const countMap: Record<string, number> = {}
  orderCounts.forEach((g) => {
    countMap[g.paymentStatus] = g._count
  })

  const badges: string[] = []
  if ((countMap['PAID'] || 0) >= 10) badges.push('Premium Member')
  if (recentOrders.some((o) =>
    o.orderSellers.some((s) => s.status === 'SELESAI')
  )) badges.push('Pecinta Organik')

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <CustomerHeader />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#006E2F] mb-6 transition-colors">
          ← Kembali Belanja
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm p-6 mb-4 flex items-center gap-4">
          <div className="flex-shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-20 w-20 rounded-full object-cover border-4 border-[#E6EEFF]"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-[#006E2F] flex items-center justify-center text-white text-2xl font-bold">
                {user.fullName[0]}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{user.fullName}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {badges.length === 0 && (
                <span className="text-xs text-[#8F9093]">Member Toko Tani</span>
              )}
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="text-xs font-semibold text-[#006E2F] bg-[#E6EEFF] px-2.5 py-0.5 rounded-full"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-gray-900">Pesanan Saya</h2>
            <Link
              href="/pesanan"
              className="text-sm font-semibold text-[#006E2F] hover:underline flex items-center gap-1"
            >
              Lihat Riwayat Pesanan <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
              <Link
                key={status}
                href={`/pesanan?status=${status}`}
                id={`order-status-${status}`}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#F8F9FF] transition-colors relative"
              >
                <div className="relative">
                  <div className="h-12 w-12 bg-[#E6EEFF] rounded-full flex items-center justify-center text-xl">
                    {ORDER_STATUS_ICONS[status]}
                  </div>
                  {countMap['PENDING'] && status === 'MENUNGGU_PEMBAYARAN' ? (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {countMap['PENDING']}
                    </span>
                  ) : null}
                </div>
                <span className="text-[11px] text-gray-600 text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Pahlawan Pangan Banner */}
        <div className="bg-[#006E2F] rounded-2xl p-5 mb-4 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrophyIcon className="h-5 w-5 text-[#22C55E]" />
              <h3 className="font-extrabold text-white">Pahlawan Pangan Lokal</h3>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              &ldquo;Terus belanja produk lokal dan dukung petani Indonesia untuk masa depan pangan yang lebih baik!&rdquo;
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-24 opacity-10">
            <div className="h-full w-full bg-gradient-to-l from-[#22C55E]" />
          </div>
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm overflow-hidden">
          {[
            { href: '/profil/edit', icon: '👤', label: 'Edit Profil' },
            { href: '/alamat', icon: <MapPinIcon className="h-5 w-5" />, label: 'Daftar Alamat Pengiriman' },
            { href: '/pembayaran', icon: <CreditCardIcon className="h-5 w-5" />, label: 'Metode Pembayaran Tersimpan' },
            { href: '/bantuan', icon: <QuestionMarkCircleIcon className="h-5 w-5" />, label: 'Pusat Bantuan' },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              id={`profil-menu-${i}`}
              className="flex items-center gap-3 px-5 py-4 border-b border-[#E7E8EC] last:border-b-0 hover:bg-[#F8F9FF] transition-colors group"
            >
              <span className="text-gray-500 group-hover:text-[#006E2F] transition-colors">
                {typeof item.icon === 'string' ? item.icon : item.icon}
              </span>
              <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
              <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-[#006E2F] transition-colors" />
            </Link>
          ))}

          {/* Logout */}
          <button
            id="logout-btn"
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition-colors group"
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client')
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-500" />
            <span className="flex-1 text-sm font-medium text-red-500 text-left">Keluar Akun</span>
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
