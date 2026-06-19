'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type WithdrawalHistory = {
  id: string
  amount: number
  status: string
  createdAt: Date
  adminNote: string | null
}

interface TarikDanaClientProps {
  balance: number
  bankInfo: {
    bankName: string | null
    bankAccountNumber: string | null
    bankAccountHolder: string | null
  }
  history: WithdrawalHistory[]
}

export default function TarikDanaClient({ balance, bankInfo, history }: TarikDanaClientProps) {
  const router = useRouter()
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isBankInfoComplete = bankInfo.bankName && bankInfo.bankAccountNumber && bankInfo.bankAccountHolder

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount < 10000) {
      setError('Minimal penarikan adalah Rp 10.000')
      return
    }

    if (numAmount > balance) {
      setError('Saldo tidak mencukupi')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/mitra/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount })
      })
      const data = await res.json()

      if (res.ok) {
        alert(data.message)
        setAmount('')
        router.refresh()
      } else {
        setError(data.error || 'Gagal mengajukan penarikan')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'COMPLETED': return 'bg-green-100 text-green-700'
      case 'REJECTED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID').format(val)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Kolom Kiri: Form Tarik Dana */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl border border-[#E7E8EC] p-6 shadow-sm">
          <h2 className="text-gray-500 font-medium text-sm mb-2">Total Saldo Aktif</h2>
          <p className="text-3xl font-extrabold text-[#006E2F] mb-6">
            Rp {formatRupiah(balance)}
          </p>

          {!isBankInfoComplete ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
              Anda belum melengkapi informasi rekening bank. Silakan lengkapi di halaman <a href="/mitra/profil/edit" className="font-bold underline">Profil</a> sebelum menarik dana.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 text-sm">
                <p className="text-gray-500 mb-1">Cairkan ke rekening:</p>
                <p className="font-bold text-gray-900">{bankInfo.bankName}</p>
                <p className="text-gray-700">{bankInfo.bankAccountNumber} a.n {bankInfo.bankAccountHolder}</p>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Input
                id="amount"
                type="number"
                label="Nominal Penarikan (Rp)"
                placeholder="Contoh: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="10000"
                max={balance}
                required
              />

              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Tarik Dana Sekarang
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Kolom Kanan: Riwayat Penarikan */}
      <div className="md:col-span-2">
        <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E7E8EC]">
            <h2 className="text-lg font-extrabold text-gray-900">Riwayat Penarikan Dana</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-[#E7E8EC] text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Nominal</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Catatan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E8EC]">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Belum ada riwayat penarikan dana.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        Rp {formatRupiah(item.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.adminNote || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  )
}
