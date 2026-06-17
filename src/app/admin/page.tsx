import { Metadata } from 'next'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export const metadata: Metadata = { title: 'Dashboard Super Admin — Toko Tani Admin' }

function formatRupiah(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

export default async function AdminDashboardPage() {
  const user = await requireAuth([UserRole.ADMIN])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    txToday,
    petaniCount,
    customerCount,
    featuredProducts,
    recentNotifs,
    recentReports,
    commissionSetting,
  ] = await Promise.all([
    // Total transaksi hari ini
    prisma.order.aggregate({
      where: { createdAt: { gte: today }, paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
    // Petani aktif
    prisma.petaniProfile.count({ where: { verificationStatus: 'ACTIVE' } }),
    // Konsumen terdaftar
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    // Produk featured (kurasi)
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        petani: { select: { farmName: true } },
      },
      take: 4,
    }),
    // Notif operasional: petani pending verif
    prisma.petaniProfile.findMany({
      where: { verificationStatus: 'PENDING_VERIFICATION' },
      include: { user: { select: { fullName: true, createdAt: true } }, },
      take: 3,
      orderBy: { user: { createdAt: 'desc' } },
    }),
    // Laporan keluhan terbaru
    prisma.report.findMany({
      where: { status: 'OPEN' },
      include: { reporter: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    // Commission setting
    prisma.platformSetting.findUnique({ where: { key: 'commission_percentage' } }),
  ])

  const txAmount = txToday._sum.total ? parseFloat(txToday._sum.total as unknown as string) : 0
  // Total komisi = tx * commission%
  const commPct = parseFloat(commissionSetting?.value || '3.5')
  const commAmount = txAmount * (commPct / 100)

  const stats = [
    {
      label: 'Transaksi Hari Ini',
      value: formatRupiah(txAmount),
      badge: '+12%',
      color: 'text-[#22C55E]',
    },
    {
      label: 'Petani Aktif',
      value: petaniCount.toLocaleString('id-ID'),
      badge: '+ 48 Baru',
      color: 'text-blue-500',
    },
    {
      label: 'Konsumen Terdaftar',
      value: customerCount.toLocaleString('id-ID'),
      badge: '+5.2%',
      color: 'text-purple-500',
    },
    {
      label: 'Komisi Sistem',
      value: formatRupiah(commAmount),
      badge: 'Est. Bersih',
      color: 'text-orange-500',
    },
  ]

  const operasional = [
    ...recentNotifs.map((p) => ({
      type: 'verify' as const,
      title: 'Verifikasi Akun Petani Baru',
      desc: `${p.user.fullName}`,
      time: new Date(p.user.createdAt!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      id: p.userId,
    })),
    ...recentReports.map((r) => ({
      type: 'complaint' as const,
      title: 'Laporan Keluhan Konsumen',
      desc: r.reason,
      time: new Date(r.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      id: r.id,
    })),
  ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5)

  return (
    <AdminDashboardClient
      adminName={user.fullName.split(' ')[0]}
      adminAvatar={user.avatarUrl}
      stats={stats}
      featuredProducts={featuredProducts as any}
      operasional={operasional}
    />
  )
}
