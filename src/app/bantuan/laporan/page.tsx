'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function LaporanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    reason: '',
    orderId: '',
    detail: '',
  })

  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/report/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Terjadi kesalahan')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E7E8EC] max-w-md w-full text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Laporan Terkirim!</h2>
          <p className="text-gray-600 mb-8">
            Terima kasih telah memberitahu kami. Tim operasional Toko Tani akan segera meninjau dan menyelesaikan keluhan Anda.
          </p>
          <Link
            href="/bantuan"
            className="block w-full py-3 bg-[#006E2F] text-white font-bold rounded-xl hover:bg-[#005525] transition-colors"
          >
            Kembali ke Pusat Bantuan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] pb-12">
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/bantuan" className="text-sm font-medium text-gray-500 hover:text-[#006E2F] flex items-center gap-1">
            <ArrowLeftIcon className="h-4 w-4" />
            Kembali
          </Link>
          <span className="font-extrabold text-[#006E2F]">Toko Tani Laporan</span>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Buat Laporan / Keluhan</h1>
        <p className="text-gray-600 mb-8">Ceritakan kendala yang Anda alami. Kami akan membantu Anda menemukan solusinya.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-[#E7E8EC] p-6 md:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Apa yang ingin Anda laporkan? <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#E7E8EC] focus:outline-none focus:ring-2 focus:ring-[#006E2F] bg-gray-50"
            >
              <option value="" disabled>Pilih kategori masalah</option>
              <option value="Pesanan rusak / bermasalah">Pesanan rusak / bermasalah</option>
              <option value="Masalah pengiriman (terlambat / hilang)">Masalah pengiriman (terlambat / hilang)</option>
              <option value="Bug / Error pada Website">Bug / Error pada Website</option>
              <option value="Kendala Pembayaran">Kendala Pembayaran</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              ID Pesanan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: TT-ORD-123"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#E7E8EC] focus:outline-none focus:ring-2 focus:ring-[#006E2F] bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Isi jika laporan terkait dengan pesanan tertentu.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Detail Keluhan <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="Jelaskan secara detail masalah yang Anda alami..."
              value={formData.detail}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#E7E8EC] focus:outline-none focus:ring-2 focus:ring-[#006E2F] bg-gray-50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#006E2F] text-white font-bold rounded-xl hover:bg-[#005525] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
        </form>
      </div>
    </div>
  )
}
