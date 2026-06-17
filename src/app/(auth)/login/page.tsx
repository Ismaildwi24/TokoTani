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

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-[#006E2F]">
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
              Selamat Datang Kembali, Ibu!
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

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E7E8EC]" />
            </div>
            <div className="relative flex justify-center text-xs text-[#8F9093]">
              <span className="bg-white px-3 uppercase tracking-wider">Atau Masuk Dengan</span>
            </div>
          </div>

          <button
            id="login-google-btn"
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-[#E7E8EC] bg-white text-sm font-semibold text-gray-700 hover:border-[#22C55E] hover:bg-[#F8F9FF] transition-all"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

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
