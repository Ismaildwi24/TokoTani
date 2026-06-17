import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Buat user di database jika belum ada (Google OAuth)
      const role = data.user.user_metadata?.role || 'CUSTOMER'
      const fullName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split('@')[0] ||
        'Pengguna Baru'

      // Upsert user ke DB
      await fetch(`${origin}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          fullName,
          role,
          avatarUrl: data.user.user_metadata?.avatar_url,
        }),
      })

      // Redirect sesuai role
      if (role === 'ADMIN') return NextResponse.redirect(`${origin}/admin`)
      if (role === 'PETANI') return NextResponse.redirect(`${origin}/mitra`)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
