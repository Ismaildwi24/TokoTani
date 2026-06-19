'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

function formatRupiah(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

interface PendingOrder {
  id: string
  orderCode: string
  total: number | string
  manualProofUrl: string | null
  customer: { fullName: string }
  orderSellers: Array<{ petani: { farmName: string } }>
}

interface UserData {
  id: string
  fullName: string
  email: string
  role: string
  status: string
  createdAt: string
  petaniProfile: { verificationStatus: string } | null
}

interface Props {
  pendingOrders: PendingOrder[]
  users: UserData[]
}

export default function AdminOperasionalClient({ pendingOrders: initialOrders, users: initialUsers }: Props) {
  const [activeTab, setActiveTab] = useState<'payment' | 'users'>('payment')
  const [orders, setOrders] = useState(initialOrders)
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('semua')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'semua' || u.role.toLowerCase() === roleFilter.toLowerCase()
    return matchSearch && matchRole
  })

  async function verifyPayment(orderId: string, approve: boolean) {
    setProcessingId(orderId)
    try {
      const res = await fetch(`/api/admin/order/${orderId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve }),
      })
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId))
      }
    } finally {
      setProcessingId(null)
    }
  }

  async function updateUserStatus(userId: string, action: 'suspend' | 'block' | 'activate' | 'verifyPetani') {
    await fetch(`/api/admin/user/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u
        const newStatus = action === 'activate' || action === 'verifyPetani' ? 'ACTIVE' : action === 'suspend' ? 'SUSPENDED' : 'REJECTED'
        return {
          ...u,
          status: newStatus,
          petaniProfile: u.petaniProfile ? { ...u.petaniProfile, verificationStatus: action === 'verifyPetani' ? 'ACTIVE' : u.petaniProfile.verificationStatus } : null
        }
      })
    )
  }

  const roleLabel: Record<string, string> = {
    CUSTOMER: 'Konsumen',
    PETANI: 'Petani',
    ADMIN: 'Admin',
  }

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    SUSPENDED: 'bg-yellow-100 text-yellow-700',
    REJECTED: 'bg-red-100 text-red-700',
    PENDING_VERIFICATION: 'bg-gray-100 text-gray-600',
  }

  const statusLabel: Record<string, string> = {
    ACTIVE: 'Aktif',
    SUSPENDED: 'Ditangguhkan',
    REJECTED: 'Diblokir',
    PENDING_VERIFICATION: 'Dilaporkan',
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-lg font-extrabold text-[#006E2F]">
              Toko Tani Admin
            </Link>
            <nav className="hidden sm:flex items-center gap-5">
              <Link href="/admin" className="text-sm text-gray-600 hover:text-[#006E2F] transition-colors">
                Beranda
              </Link>
              <Link href="/admin/operasional" className="text-sm font-semibold text-[#006E2F] border-b-2 border-[#006E2F] pb-0.5">
                Operasional
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <BellIcon className="h-5 w-5 text-gray-500" />
            <Link
              href="/admin/operasional"
              className="px-4 py-2 bg-[#006E2F] text-white text-sm font-semibold rounded-full"
            >
              Unduh Laporan
            </Link>
            <div className="h-9 w-9 rounded-full bg-[#006E2F] flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Pusat Operasional</h1>
          <p className="text-sm text-[#8F9093] mt-1">Kelola transaksi harian dan ekosistem pengguna.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-3 mb-6">
          <button
            id="tab-verifikasi-pembayaran"
            onClick={() => setActiveTab('payment')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'payment'
                ? 'bg-[#006E2F] text-white shadow-sm'
                : 'bg-white border border-[#E7E8EC] text-gray-600 hover:border-[#22C55E]'
            }`}
          >
            Verifikasi Pembayaran
          </button>
          <button
            id="tab-manajemen-pengguna"
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-[#006E2F] text-white shadow-sm'
                : 'bg-white border border-[#E7E8EC] text-gray-600 hover:border-[#22C55E]'
            }`}
          >
            Manajemen Pengguna
          </button>
        </div>

        {/* Payment Verification Tab */}
        {activeTab === 'payment' && (
          <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm overflow-hidden">
            {/* Search + Sort */}
            <div className="p-4 border-b border-[#E7E8EC] flex items-center justify-between gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8F9093]" />
                <input
                  type="text"
                  placeholder="Cari ID atau Nama..."
                  className="pl-9 pr-4 py-2 rounded-full border border-[#E7E8EC] text-sm bg-[#F8F9FF] focus:outline-none focus:ring-2 focus:ring-[#22C55E] w-72"
                />
              </div>
              <select className="px-4 py-2 rounded-full border border-[#E7E8EC] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]">
                <option>Urutkan: Paling Lama</option>
                <option>Urutkan: Terbaru</option>
                <option>Urutkan: Nilai Tertinggi</option>
              </select>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-[#8F9093]">
                Tidak ada pembayaran yang perlu diverifikasi.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E7E8EC] text-xs text-[#8F9093] uppercase tracking-wide">
                    <th className="text-left px-5 py-3">ID Order</th>
                    <th className="text-left px-5 py-3">Pembeli & Petani</th>
                    <th className="text-left px-5 py-3">Total Bayar</th>
                    <th className="text-left px-5 py-3">Bukti Transfer</th>
                    <th className="text-right px-5 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E8EC]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F8F9FF] transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                        #{order.orderCode}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">
                          Pembeli: <strong>{order.customer.fullName}</strong>
                        </p>
                        <p className="text-xs text-[#8F9093]">
                          Petani: {order.orderSellers[0]?.petani.farmName || '-'}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#22C55E]">
                        {formatRupiah(order.total)}
                      </td>
                      <td className="px-5 py-4">
                        {order.manualProofUrl ? (
                          <a
                            href={order.manualProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            id={`lihat-foto-${order.id}`}
                            className="px-3 py-1.5 border border-[#E7E8EC] text-sm text-gray-600 rounded-lg hover:border-[#22C55E] hover:text-[#006E2F] transition-colors"
                          >
                            Lihat Foto
                          </a>
                        ) : (
                          <span className="text-xs text-[#8F9093]">Belum ada</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            id={`terima-${order.id}`}
                            onClick={() => verifyPayment(order.id, true)}
                            disabled={processingId === order.id}
                            className="px-4 py-1.5 bg-[#006E2F] hover:bg-[#005525] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Terima
                          </button>
                          <button
                            id={`tolak-${order.id}`}
                            onClick={() => verifyPayment(order.id, false)}
                            disabled={processingId === order.id}
                            className="px-4 py-1.5 border border-red-300 text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="px-5 py-3 text-center text-sm text-[#006E2F] font-semibold hover:underline cursor-pointer border-t border-[#E7E8EC]">
                      Muat Lebih Banyak...
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm overflow-hidden">
            {/* Search + Filter */}
            <div className="p-4 border-b border-[#E7E8EC] flex items-center justify-between gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8F9093]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau email pengguna..."
                  className="pl-9 pr-4 py-2 rounded-full border border-[#E7E8EC] text-sm bg-[#F8F9FF] focus:outline-none focus:ring-2 focus:ring-[#22C55E] w-72"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 rounded-full border border-[#E7E8EC] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              >
                <option value="semua">Semua Peran</option>
                <option value="customer">Konsumen</option>
                <option value="petani">Petani</option>
              </select>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E7E8EC] text-xs text-[#8F9093] uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Nama Pengguna</th>
                  <th className="text-left px-5 py-3">Peran</th>
                  <th className="text-left px-5 py-3">Tanggal Gabung</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E8EC]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8F9FF] transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900">{u.fullName}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{roleLabel[u.role] || u.role}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          statusColor[u.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {statusLabel[u.status] || u.status}
                        {u.role === 'PETANI' && u.petaniProfile?.verificationStatus === 'PENDING_VERIFICATION' && ' (Menunggu Verifikasi)'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 justify-end">
                        {u.role === 'PETANI' && u.petaniProfile?.verificationStatus === 'PENDING_VERIFICATION' && (
                          <button
                            id={`verifikasi-${u.id}`}
                            onClick={() => updateUserStatus(u.id, 'verifyPetani')}
                            className="px-3 py-1.5 bg-[#006E2F] hover:bg-[#005525] text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Verifikasi
                          </button>
                        )}
                        <button
                          id={`tangguhkan-${u.id}`}
                          onClick={() => updateUserStatus(u.id, u.status === 'SUSPENDED' ? 'activate' : 'suspend')}
                          className="px-3 py-1.5 border border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          {u.status === 'SUSPENDED' ? 'Aktifkan' : 'Tangguhkan'}
                        </button>
                        <button
                          id={`blokir-${u.id}`}
                          onClick={() => updateUserStatus(u.id, 'block')}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Blokir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="px-5 py-3 border-t border-[#E7E8EC]">
                    <div className="flex items-center justify-between text-sm text-[#8F9093]">
                      <span>Menampilkan 1-{filteredUsers.length} dari {users.length} pengguna</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((p) => (
                          <button
                            key={p}
                            className={`h-8 w-8 rounded-lg text-sm font-semibold transition-colors ${
                              p === 1
                                ? 'bg-[#006E2F] text-white'
                                : 'text-gray-600 hover:bg-[#E6EEFF]'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-[#8F9093] py-5 border-t border-[#E7E8EC] mt-8">
        © 2026 Toko Tani Indonesia. Hak Cipta Dilindungi. Sistem Manajemen Super Admin v2.4.0
      </footer>
    </div>
  )
}
