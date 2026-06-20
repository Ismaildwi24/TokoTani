'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRightOnRectangleIcon, BellIcon, ShoppingCartIcon, CameraIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface EditProfilClientProps {
  user: {
    id: string
    fullName: string
    email: string
    phone: string | null
    gender: string | null
    avatarUrl: string | null
  }
  petaniProfile?: {
    bankName: string | null
    bankAccountNumber: string | null
    bankAccountHolder: string | null
  } | null
  returnPath?: string
}

export default function EditProfilClient({ user, returnPath, petaniProfile }: EditProfilClientProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    gender: user.gender || '',
    bankName: petaniProfile?.bankName || '',
    bankAccountNumber: petaniProfile?.bankAccountNumber || '',
    bankAccountHolder: petaniProfile?.bankAccountHolder || '',
  })
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 2 MB.')
      return
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Format harus .JPEG atau .PNG.')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let avatarUrl = user.avatarUrl

      // Upload avatar jika ada file baru
      if (avatarFile) {
        const fd = new FormData()
        fd.append('file', avatarFile)
        fd.append('bucket', 'profile-photos')
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        const upData = await upRes.json()
        if (upRes.ok) avatarUrl = upData.url
      }

      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, avatarUrl }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push(returnPath || '/profil'), 1500)
      } else {
        const body = await res.json()
        setError(body.error || 'Gagal menyimpan perubahan.')
      }
    } catch {
      setError('Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Simple header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={returnPath || '/'} className="flex items-center gap-2">
            <Image src="/logo.png" alt="Toko Tani Logo" width={28} height={28} className="object-contain" />
            <span className="text-lg font-extrabold text-[#006E2F]">Toko Tani</span>
          </Link>
          <div className="flex items-center gap-3">
            <BellIcon className="h-5 w-5 text-gray-500 hover:text-[#006E2F] cursor-pointer" />
            <ShoppingCartIcon className="h-5 w-5 text-gray-500 hover:text-[#006E2F] cursor-pointer" />
            <div className="h-8 w-8 rounded-full bg-[#006E2F] flex items-center justify-center text-white text-xs font-bold">
              {user.fullName[0]}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link href={returnPath || '/profil'} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#006E2F] transition-colors">
            ← Kembali
          </Link>
          <button
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client')
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Keluar Akun
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Biodata Diri</h1>

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              ✅ Perubahan berhasil disimpan!
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Avatar */}
            <div className="flex items-center gap-5 mb-7">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-[#22C55E]">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#006E2F] flex items-center justify-center text-white text-3xl font-bold">
                      {user.fullName[0]}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <button
                  id="pick-photo-btn"
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 border-2 border-[#006E2F] text-[#006E2F] text-sm font-semibold rounded-full hover:bg-[#006E2F] hover:text-white transition-colors flex items-center gap-2"
                >
                  <CameraIcon className="h-4 w-4" />
                  Pilih Foto
                </button>
                <p className="text-xs text-[#8F9093] mt-1.5">
                  Ukuran gambar: maks. 2 MB. Format: .JPEG, .PNG
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="h-px bg-[#E7E8EC] mb-6" />

            {/* Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input
                id="edit-fullname"
                label="Nama Lengkap"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
              <Input
                id="edit-email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div className="mb-5">
              <Input
                id="edit-phone"
                label="Nomor Telepon"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>

            {/* Gender */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
              <div className="flex gap-6">
                {[
                  { value: 'LAKI_LAKI', label: 'Laki-laki' },
                  { value: 'PEREMPUAN', label: 'Perempuan' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setForm((f) => ({ ...f, gender: opt.value }))}
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        form.gender === opt.value
                          ? 'border-[#006E2F] bg-[#006E2F]'
                          : 'border-[#E7E8EC] hover:border-[#22C55E]'
                      }`}
                    >
                      {form.gender === opt.value && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#E7E8EC] mb-5" />

            {/* Petani Financial Details */}
            {petaniProfile !== undefined && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-gray-900 mb-4">Informasi Penarikan Dana</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Input
                      id="edit-bank-name"
                      label="Nama Bank / E-Wallet"
                      placeholder="e.g. BCA, Mandiri, GoPay, OVO"
                      value={form.bankName}
                      onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                    />
                    <Input
                      id="edit-bank-account"
                      label="Nomor Rekening / Nomor HP"
                      value={form.bankAccountNumber}
                      onChange={(e) => setForm((f) => ({ ...f, bankAccountNumber: e.target.value }))}
                    />
                  </div>
                  <Input
                    id="edit-bank-holder"
                    label="Nama Pemilik Rekening"
                    value={form.bankAccountHolder}
                    onChange={(e) => setForm((f) => ({ ...f, bankAccountHolder: e.target.value }))}
                  />
                </div>
                <div className="h-px bg-[#E7E8EC] mb-5" />
              </>
            )}

            <div className="flex justify-end">
              <Button
                id="save-profile-btn"
                type="submit"
                variant="secondary"
                size="lg"
                loading={loading}
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-[#E7E8EC] bg-[#E6EEFF]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <span className="font-bold text-gray-800">Toko Tani</span>
          <nav className="flex gap-5">
            <Link href="/tentang" className="hover:text-[#006E2F]">About Us</Link>
            <Link href="/sustainability" className="hover:text-[#006E2F]">Sustainability</Link>
            <Link href="/privasi" className="hover:text-[#006E2F]">Privacy Policy</Link>
            <Link href="/bantuan" className="hover:text-[#006E2F]">Help Center</Link>
          </nav>
          <span>© 2024 Toko Tani. Empowering Local Farmers.</span>
        </div>
      </footer>
    </div>
  )
}
