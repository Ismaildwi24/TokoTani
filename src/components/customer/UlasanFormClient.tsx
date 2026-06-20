'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

type ReviewItem = {
  orderItemId: string
  productId: string
  productName: string
  farmName: string
  imageUrl: string
  existingReview: { rating: number, comment: string | null } | null
}

interface Props {
  orderId: string
  items: ReviewItem[]
}

export default function UlasanFormClient({ orderId, items }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  
  // State for forms
  const [reviews, setReviews] = useState<Record<string, { rating: number, comment: string }>>(
    items.reduce((acc, item) => ({
      ...acc,
      [item.orderItemId]: {
        rating: item.existingReview?.rating || 0,
        comment: item.existingReview?.comment || ''
      }
    }), {})
  )

  const handleRatingChange = (orderItemId: string, rating: number) => {
    setReviews(prev => ({
      ...prev,
      [orderItemId]: { ...prev[orderItemId], rating }
    }))
  }

  const handleCommentChange = (orderItemId: string, comment: string) => {
    setReviews(prev => ({
      ...prev,
      [orderItemId]: { ...prev[orderItemId], comment }
    }))
  }

  const handleSubmit = async () => {
    // Validate
    const payload = items.map(item => ({
      orderItemId: item.orderItemId,
      productId: item.productId,
      rating: reviews[item.orderItemId].rating,
      comment: reviews[item.orderItemId].comment
    }))

    const incomplete = payload.find(p => p.rating === 0)
    if (incomplete) {
      alert('Mohon berikan rating bintang untuk semua produk.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/order/${orderId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: payload })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gagal mengirim ulasan')
      } else {
        alert('Ulasan berhasil dikirim! Terima kasih.')
        router.push('/pesanan')
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/pesanan" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#006E2F] mb-6 transition-colors">
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke Riwayat Pesanan
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Beri Ulasan Produk</h1>
        <p className="text-sm text-[#8F9093] mt-1">Bagikan pengalaman Anda tentang kualitas produk yang diterima.</p>
      </div>

      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.orderItemId} className="bg-white rounded-2xl border border-[#E7E8EC] p-6 shadow-sm">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
              <img src={item.imageUrl} alt={item.productName} className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
              <div>
                <h3 className="font-bold text-gray-900">{item.productName}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Toko: {item.farmName}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kualitas Produk</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(item.orderItemId, star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-8 h-8 ${star <= reviews[item.orderItemId].rating ? 'text-yellow-400' : 'text-gray-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ulasan (Opsional)</label>
              <textarea
                rows={3}
                value={reviews[item.orderItemId].comment}
                onChange={(e) => handleCommentChange(item.orderItemId, e.target.value)}
                placeholder="Ceritakan kepuasan Anda terhadap produk ini..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006E2F] focus:border-transparent text-sm resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3 bg-[#006E2F] text-white font-bold rounded-full hover:bg-[#005525] transition-colors active:scale-95 shadow-md disabled:opacity-50"
        >
          {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
        </button>
      </div>
    </main>
  )
}
