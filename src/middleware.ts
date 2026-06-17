import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes — tidak butuh auth
  const publicRoutes = ['/login', '/register', '/register/petani', '/api/midtrans/webhook']
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r))

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // Cek metadata role (disimpan di user_metadata saat registrasi)
    const role = user.user_metadata?.role as string | undefined

    // Jika sudah login dan ke halaman auth, redirect sesuai role
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url))
      if (role === 'PETANI') return NextResponse.redirect(new URL('/mitra', request.url))
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Guard route groups
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      if (role === 'PETANI') return NextResponse.redirect(new URL('/mitra', request.url))
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (pathname.startsWith('/mitra') && role !== 'PETANI') {
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url))
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
