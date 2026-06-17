'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type RegisterType = 'customer' | 'petani'

export default function RegisterPage() {
  const router = useRouter()
  const [type, setType] = useState<RegisterType>('customer')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Petani fields
    farmName: '',
    location: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Kata sandi tidak cocok.')
      return
    }

    if (form.password.length < 8) {
      setError('Kata sandi minimal 8 karakter.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // Register dengan Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            role: type === 'petani' ? 'PETANI' : 'CUSTOMER',
          },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      // Buat user di database via API
      if (data.user) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email: form.email,
            fullName: form.fullName,
            phone: form.phone,
            role: type === 'petani' ? 'PETANI' : 'CUSTOMER',
            farmName: form.farmName,
            location: form.location,
          }),
        })

        if (!res.ok) {
          const body = await res.json()
          setError(body.error || 'Gagal membuat akun.')
          return
        }
      }

      if (type === 'petani') {
        router.push('/register/petani/sukses')
      } else {
        router.push('/')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-[#006E2F]">
          Toko Tani
        </Link>
        <span className="text-sm text-gray-500">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-[#006E2F] hover:underline">
            Masuk
          </Link>
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E8EC] p-8 w-full max-w-lg">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Buat Akun Baru</h1>
          <p className="text-sm text-[#8F9093] mb-6">
            Bergabunglah dengan ekosistem pertanian lokal Indonesia.
          </p>

          {/* Toggle Type */}
          <div className="flex rounded-xl border border-[#E7E8EC] p-1 mb-6">
            <button
              id="register-type-customer"
              type="button"
              onClick={() => setType('customer')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'customer'
                  ? 'bg-[#22C55E] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pembeli
            </button>
            <button
              id="register-type-petani"
              type="button"
              onClick={() => setType('petani')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'petani'
                  ? 'bg-[#22C55E] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Petani / Mitra
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {type === 'petani' && (
            <div className="mb-4 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
              <strong>Catatan:</strong> Akun petani memerlukan verifikasi dari Admin sebelum bisa upload produk.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="register-fullname"
              type="text"
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              icon={<UserIcon className="h-4 w-4" />}
              required
            />

            <Input
              id="register-email"
              type="email"
              label="Alamat Email"
              placeholder="contoh@email.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              icon={<EnvelopeIcon className="h-4 w-4" />}
              required
            />

            <Input
              id="register-phone"
              type="tel"
              label="Nomor Telepon"
              placeholder="081234567890"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              icon={<PhoneIcon className="h-4 w-4" />}
            />

            {type === 'petani' && (
              <>
                <Input
                  id="register-farmname"
                  type="text"
                  label="Nama Kebun / Usaha"
                  placeholder="Contoh: Kebun Hijau Makmur"
                  value={form.farmName}
                  onChange={(e) => update('farmName', e.target.value)}
                  required
                />
                <Input
                  id="register-location"
                  type="text"
                  label="Lokasi Kebun"
                  placeholder="Contoh: Lembang, Bandung Barat"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  required
                />
              </>
            )}

            <Input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              label="Kata Sandi"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              icon={<LockClosedIcon className="h-4 w-4" />}
              rightIcon={
                showPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )
              }
              onRightIconClick={() => setShowPassword(!showPassword)}
              required
            />

            <Input
              id="register-confirm-password"
              type={showPassword ? 'text' : 'password'}
              label="Konfirmasi Kata Sandi"
              placeholder="Ulangi kata sandi"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              icon={<LockClosedIcon className="h-4 w-4" />}
              required
            />

            <Button
              id="register-submit-btn"
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
            >
              {type === 'petani' ? 'Daftar sebagai Mitra' : 'Daftar Sekarang'} →
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-[#006E2F] hover:underline">
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#8F9093]">
        © 2026 Toko Tani Ecosystem. Memberdayakan Petani Lokal.
      </footer>
    </div>
  )
}
