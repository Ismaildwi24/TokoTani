'use client'

import Link from 'next/link'
import { ArrowLeftIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { BuildingLibraryIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

interface OrderDetailProps {
  order: any
}

function formatRupiah(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

export default function PesananDetailClient({ order }: OrderDetailProps) {
  const [copied, setCopied] = useState(false)

  const [loadingPayment, setLoadingPayment] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)

  const handleComplete = async (sellerId: string) => {
    if (!confirm('Apakah Anda yakin telah menerima pesanan ini dengan baik?')) return
    setCompletingId(sellerId)
    try {
      const res = await fetch(`/api/order/seller/${sellerId}/complete`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json()
        alert(body.error || 'Gagal menyelesaikan pesanan')
      } else {
        window.location.reload()
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan')
    } finally {
      setCompletingId(null)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText('1234567890')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMidtransPayment = async () => {
    setLoadingPayment(true)
    try {
      const res = await fetch('/api/midtrans/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })
      const data = await res.json()
      if (res.ok && data.snapToken) {
        // @ts-ignore
        window.snap?.pay(data.snapToken, {
          onSuccess: function() {
            setLoadingPayment(true)
            setTimeout(() => {
              window.location.reload()
            }, 3000)
          },
          onPending: function() {
            window.location.reload()
          },
          onError: function() {
            window.location.reload()
          },
          onClose: function() {
            // Do nothing, let user stay on this page
          }
        })
      } else {
        alert(data.error || 'Gagal memuat pembayaran Midtrans')
      }
    } catch {
      alert('Terjadi kesalahan jaringan saat memanggil payment gateway.')
    } finally {
      setLoadingPayment(false)
    }
  }

  const [canceling, setCanceling] = useState(false)
  const handleCancel = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return
    
    setCanceling(true)
    try {
      const res = await fetch(`/api/order/${order.id}/cancel`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json()
        alert(body.error || 'Gagal membatalkan pesanan')
      } else {
        window.location.reload()
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan')
    } finally {
      setCanceling(false)
    }
  }

  const isPendingManual = order.paymentStatus === 'PENDING' && order.paymentMethod === 'MANUAL_TRANSFER'
  const isPendingMidtrans = order.paymentStatus === 'PENDING' && order.paymentMethod === 'MIDTRANS'
  const isQris = order.midtransPaymentType === 'MANUAL_QRIS'

  const [uploading, setUploading] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)

  const handleUploadProof = async () => {
    if (!proofFile) return alert('Silakan pilih file bukti pembayaran terlebih dahulu.')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', proofFile)
      formData.append('bucket', 'order-proofs')
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Gagal unggah gambar')

      const proofUrl = uploadData.url

      const res = await fetch(`/api/order/${order.id}/upload-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofUrl }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan bukti pembayaran')
      
      alert('Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.')
      window.location.reload()
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/pesanan" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#006E2F] mb-6 transition-colors">
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke Riwayat Pesanan
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Detail Pesanan</h1>
          <p className="text-sm text-[#8F9093] mt-1">Order ID: <span className="font-semibold text-gray-900">{order.orderCode}</span></p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${
          order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
          order.paymentStatus === 'PENDING' ? 'bg-orange-100 text-orange-700' :
          order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {order.paymentStatus === 'PAID' ? 'LUNAS' : order.paymentStatus === 'PENDING' ? (order.manualProofUrl ? 'MENUNGGU VERIFIKASI' : 'MENUNGGU PEMBAYARAN') : 'DIBATALKAN'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Instruksi Pembayaran Manual */}
          {isPendingManual && !order.manualProofUrl && (
            <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-sm p-6 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-orange-400" />
              <h2 className="text-lg font-extrabold text-gray-900 mb-2">Selesaikan Pembayaran Anda</h2>
              <p className="text-sm text-gray-600 mb-6">
                {isQris 
                  ? "Silakan scan kode QRIS di bawah ini dengan aplikasi pembayaran Anda (Gopay, OVO, Dana, M-Banking)." 
                  : "Silakan transfer tepat sesuai nominal berikut ke rekening bank di bawah ini untuk mempercepat proses verifikasi."}
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6 gap-4">
                <div className="text-center md:text-left">
                  <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Total Tagihan</p>
                  <p className="text-3xl font-extrabold text-[#006E2F]">{formatRupiah(order.total)}</p>
                </div>
                <div className="h-12 w-px bg-gray-300 hidden md:block" />
                <div className="text-center md:text-left">
                  <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Batas Waktu</p>
                  <p className="text-base font-bold text-orange-600">1x24 Jam</p>
                </div>
              </div>

              {isQris ? (
                <div className="bg-white border border-[#E7E8EC] rounded-xl p-5 mb-6 flex flex-col items-center justify-center">
                  <h3 className="font-bold text-gray-900 mb-3 text-center">Scan QRIS Berikut</h3>
                  <img src="/qris.png" alt="QRIS Toko Tani" className="w-64 h-64 object-contain mb-3" onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/png?text=QRIS+Belum+Diunggah' }} />
                  <p className="text-xs text-gray-500 text-center">Pastikan nama penerima adalah Toko Tani</p>
                </div>
              ) : (
                <div className="bg-white border border-[#E7E8EC] rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <BuildingLibraryIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Bank BNI</h3>
                      <p className="text-xs text-gray-500">a.n. Ismail dwi muh anugrah</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-lg font-mono font-bold tracking-widest text-gray-900">1858105579</span>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-1.5 text-sm font-semibold text-[#006E2F] hover:text-[#005525] transition-colors"
                    >
                      {copied ? <span className="text-green-600">Tersalin!</span> : <><DocumentDuplicateIcon className="h-4 w-4" /> Salin</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Bukti */}
              <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-3">Unggah Bukti Pembayaran</h3>
                <p className="text-sm text-gray-600 mb-4">Setelah transfer, mohon unggah foto struk atau screenshot bukti pembayaran Anda di sini agar pesanan segera diproses.</p>
                
                <input 
                  type="file" 
                  accept="image/jpeg, image/png"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#006E2F]/10 file:text-[#006E2F] hover:file:bg-[#006E2F]/20 mb-4"
                />

                <button 
                  onClick={handleUploadProof}
                  disabled={uploading || !proofFile}
                  className="w-full px-8 py-3 bg-[#006E2F] text-white font-bold rounded-full hover:bg-[#005525] transition-colors active:scale-95 shadow-md disabled:opacity-50"
                >
                  {uploading ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="w-full px-8 py-3 bg-red-50 text-red-600 font-bold rounded-full hover:bg-red-100 transition-colors active:scale-95 shadow-sm disabled:opacity-50"
                >
                  {canceling ? 'Memproses...' : 'Batalkan Pesanan'}
                </button>
              </div>
            </div>
          )}

          {/* Menunggu Verifikasi Manual State */}
          {isPendingManual && order.manualProofUrl && (
            <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-6 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
              <h2 className="text-lg font-extrabold text-gray-900 mb-2">Menunggu Verifikasi Admin</h2>
              <p className="text-sm text-gray-600 mb-4">Bukti pembayaran Anda sudah kami terima dan sedang dalam proses pengecekan oleh Admin.</p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-center mb-4">
                <img src={order.manualProofUrl} alt="Bukti Pembayaran" className="max-h-64 object-contain rounded" />
              </div>
            </div>
          )}

          {/* Instruksi Midtrans */}
          {isPendingMidtrans && (
            <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-sm p-6 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-orange-400" />
              <h2 className="text-lg font-extrabold text-gray-900 mb-2">Selesaikan Pembayaran Anda</h2>
              <p className="text-sm text-gray-600 mb-6">Silakan klik tombol di bawah ini untuk melanjutkan pembayaran via Payment Gateway (QRIS, GoPay, Virtual Account, dll).</p>
              
              <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6 gap-4">
                <div className="text-center md:text-left">
                  <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Total Tagihan</p>
                  <p className="text-3xl font-extrabold text-[#006E2F]">{formatRupiah(order.total)}</p>
                </div>
              </div>

              <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <button 
                  onClick={handleMidtransPayment}
                  disabled={loadingPayment || canceling}
                  className="w-full sm:w-auto px-8 py-3 bg-[#006E2F] text-white font-bold rounded-full hover:bg-[#005525] transition-colors active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingPayment ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : null}
                  {loadingPayment ? 'Memuat...' : 'Bayar via Midtrans'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={canceling || loadingPayment}
                  className="w-full sm:w-auto px-8 py-3 bg-red-50 text-red-600 font-bold rounded-full hover:bg-red-100 transition-colors active:scale-95 shadow-sm disabled:opacity-50"
                >
                  {canceling ? 'Memproses...' : 'Batalkan Pesanan'}
                </button>
              </div>
            </div>
          )}

          {/* Daftar Produk */}
          <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm p-6">
            <h2 className="text-lg font-extrabold text-gray-900 mb-4">Daftar Produk</h2>
            
            <div className="space-y-6">
              {order.orderSellers.map((seller: any) => (
                <div key={seller.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 bg-[#006E2F]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#006E2F]">
                      {seller.petani.farmName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm text-gray-900">{seller.petani.farmName}</span>
                    <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
                      seller.status === 'MENUNGGU_PEMBAYARAN' ? 'bg-orange-100 text-orange-600' :
                      seller.status === 'DIPROSES' ? 'bg-blue-100 text-blue-600' :
                      seller.status === 'DIKIRIM' ? 'bg-indigo-100 text-indigo-600' :
                      seller.status === 'SELESAI' ? 'bg-green-100 text-green-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {seller.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {seller.status === 'DIKIRIM' && (
                    <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <p className="text-sm text-blue-800">
                        Pesanan ini sedang dalam perjalanan. Jika sudah Anda terima, mohon konfirmasi.
                      </p>
                      <button
                        onClick={() => handleComplete(seller.id)}
                        disabled={completingId === seller.id}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {completingId === seller.id ? 'Memproses...' : 'Pesanan Diterima'}
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    {seller.items.map((item: any) => (
                      <div key={item.id} className="flex items-start gap-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <img 
                          src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80'} 
                          alt={item.productNameSnapshot}
                          className="w-16 h-16 rounded-md object-cover border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">{item.productNameSnapshot}</h4>
                          <p className="text-xs text-gray-500 mt-1">{item.quantity} x {formatRupiah(item.priceSnapshot)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-gray-900">{formatRupiah(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Ongkir per seller (jika ada) */}
                  {parseFloat(seller.shippingCost) > 0 && (
                    <div className="mt-3 flex justify-between items-center text-sm px-1">
                      <span className="text-gray-600">Ongkos Kirim</span>
                      <span className="font-semibold text-gray-900">{formatRupiah(seller.shippingCost)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm p-6">
            <h2 className="text-lg font-extrabold text-gray-900 mb-4">Informasi Pengiriman</h2>
            <div className="text-sm">
              <p className="font-semibold text-gray-900 mb-1">{order.shippingAddress?.recipientName || 'Penerima'}</p>
              <p className="text-gray-600 mb-2">{order.shippingAddress?.phoneNumber || '-'}</p>
              <p className="text-gray-500 leading-relaxed">{order.shippingAddress?.fullAddress || 'Alamat tidak ditemukan'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm p-6">
            <h2 className="text-lg font-extrabold text-gray-900 mb-4">Ringkasan Pembayaran</h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Metode Pembayaran</span>
                <span className="font-semibold text-gray-900">{order.paymentMethod === 'MIDTRANS' ? 'QRIS / Virtual Account' : 'Transfer Manual'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Harga Barang</span>
                <span className="font-semibold text-gray-900">{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Ongkos Kirim</span>
                <span className="font-semibold text-gray-900">{formatRupiah(order.totalShippingCost)}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Tagihan</span>
              <span className="text-xl font-extrabold text-[#22C55E]">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
