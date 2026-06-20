'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('Email atau kata sandi salah. Silakan coba lagi.')
        return
      }

      if (data.user) {
        const role = data.user.user_metadata?.role
        router.refresh()
        if (role === 'ADMIN') router.push('/admin')
        else if (role === 'PETANI') router.push('/mitra')
        else router.push('/')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-[#006E2F]">
          <img src="/logo.png" alt="Logo Toko Tani" className="h-8 w-auto object-contain" />
          Toko Tani
        </Link>
        <Link
          href="/bantuan"
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#006E2F] transition-colors"
        >
          <QuestionMarkCircleIcon className="h-4 w-4" />
          Help Center
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 relative flex items-center justify-center p-4">
        {/* Background Image (blurred farm photo) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=80')`,
            filter: 'blur(2px) brightness(0.85)',
          }}
        />
        <div className="absolute inset-0 bg-white/30" />

        {/* Card */}
        <div className="relative z-10 bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-7">
            <h1 className="text-2xl font-extrabold text-gray-900">
              Selamat Datang Kembali!
            </h1>
            <p className="text-sm text-[#8F9093] mt-2">
              Masuk untuk mulai belanja sayur segar langsung dari petani.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-email"
              type="email"
              label="Email atau Nomor Telepon"
              placeholder="contoh@email.com atau 0812..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<EnvelopeIcon className="h-4 w-4" />}
              required
              autoComplete="email"
            />

            <div>
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                label="Kata Sandi"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                autoComplete="current-password"
              />
              <div className="text-right mt-1.5">
                <Link
                  href="/lupa-sandi"
                  className="text-xs font-semibold text-[#006E2F] hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
            >
              Masuk →
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Belum punya akun?{' '}
            <Link href="/register" className="font-semibold text-[#006E2F] hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E7E8EC] py-5 px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <span className="font-bold text-[#1A1A1A]">Toko Tani</span>
          <div className="flex gap-5">
            <Link href="/privasi" className="hover:text-[#006E2F]">Privacy Policy</Link>
            <Link href="/syarat" className="hover:text-[#006E2F]">Terms of Service</Link>
            <Link href="/bantuan" className="hover:text-[#006E2F]">Support</Link>
            <Link href="/kontak" className="hover:text-[#006E2F]">Contact Us</Link>
          </div>
          <span>© 2026 Toko Tani Ecosystem. Supporting local harvest.</span>
        </div>
      </footer>
    </div>
  )
}
