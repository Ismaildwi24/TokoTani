'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'

interface UploadPanenClientProps {
  categories: Array<{ id: string; name: string }>
}

export default function UploadPanenClient({ categories }: UploadPanenClientProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    price: '',
    unit: '1 kg',
    stock: '',
    description: '',
    isOrganic: false,
    isPesticideFree: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const valid = files.filter(
      (f) => ['image/jpeg', 'image/png'].includes(f.type) && f.size <= 2 * 1024 * 1024
    )
    setPhotos((prev) => [...prev, ...valid].slice(0, 5))
    setPhotoPreviews((prev) => [
      ...prev,
      ...valid.map((f) => URL.createObjectURL(f)),
    ].slice(0, 5))
  }

  function removePhoto(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
    setPhotoPreviews((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (photos.length === 0) {
      setError('Minimal upload 1 foto produk.')
      return
    }

    setLoading(true)
    try {
      // Upload foto
      const photoUrls: string[] = []
      for (const photo of photos) {
        const fd = new FormData()
        fd.append('file', photo)
        fd.append('bucket', 'product-images')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) {
          photoUrls.push(data.url)
        } else {
          throw new Error(data.error || 'Gagal upload foto')
        }
      }

      // Create product
      const res = await fetch('/api/product/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          photoUrls,
        }),
      })

      if (res.ok) {
        router.push('/mitra?uploaded=true')
      } else {
        const data = await res.json()
        setError(data.error || 'Gagal upload produk.')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/mitra" className="text-[#006E2F]">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="font-extrabold text-[#006E2F]">Upload Panen Baru</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm p-6 mb-6">
            {/* Photo Upload */}
            <h2 className="font-bold text-gray-900 mb-3">Foto Produk *</h2>
            <div className="flex flex-wrap gap-3 mb-3">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  id="upload-photo-btn"
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="h-24 w-24 rounded-xl border-2 border-dashed border-[#E7E8EC] hover:border-[#22C55E] flex flex-col items-center justify-center gap-1 text-[#8F9093] hover:text-[#006E2F] transition-colors"
                >
                  <PlusIcon className="h-6 w-6" />
                  <span className="text-[11px]">Tambah Foto</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#8F9093]">Maks. 5 foto, ukuran maks 2MB per foto. Format: .JPEG, .PNG</p>
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" multiple onChange={handlePhotoChange} className="hidden" />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm p-6 space-y-4 mb-6">
            <h2 className="font-bold text-gray-900">Informasi Produk</h2>

            <Input
              id="product-name"
              label="Nama Produk *"
              placeholder="Contoh: Bayam Hijau Segar"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori *</label>
              <select
                id="product-category"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                required
                className="w-full rounded-xl border border-[#E7E8EC] bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="product-price"
                type="number"
                label="Harga (Rp) *"
                placeholder="25000"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
                min="0"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Satuan *</label>
                <select
                  id="product-unit"
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  className="w-full rounded-xl border border-[#E7E8EC] bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                >
                  <option value="1 kg">1 kg</option>
                  <option value="250g">250 g</option>
                  <option value="500g">500 g</option>
                  <option value="ikat">ikat</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
            </div>

            <Input
              id="product-stock"
              type="number"
              label="Stok Tersedia *"
              placeholder="100"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              required
              min="0"
            />

            <Textarea
              id="product-description"
              label="Deskripsi Produk"
              placeholder="Ceritakan keunggulan produk Anda, cara budidaya, dsb..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
            />

            {/* Checkboxes */}
            <div className="space-y-3">
              {[
                { key: 'isOrganic', label: 'Produk Organik (Tersertifikasi)' },
                { key: 'isPesticideFree', label: 'Bebas Pestisida' },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    id={`check-${opt.key}`}
                    onClick={() => setForm((f) => ({ ...f, [opt.key]: !f[opt.key as keyof typeof f] }))}
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                      form[opt.key as keyof typeof form]
                        ? 'bg-[#22C55E] border-[#22C55E]'
                        : 'border-[#E7E8EC] hover:border-[#22C55E]'
                    }`}
                  >
                    {form[opt.key as keyof typeof form] && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            id="submit-product-btn"
            type="submit"
            fullWidth
            size="lg"
            variant="primary"
            loading={loading}
          >
            Upload Panen Baru
          </Button>
        </form>
      </div>
    </div>
  )
}
