import { createClient } from '@/lib/supabase/server'
import { UserRole, UserStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export type AuthUser = {
  id: string
  email: string
  fullName: string
  role: UserRole
  status: UserStatus
  avatarUrl: string | null
}

/**
 * Mengambil session user yang sedang login dari Supabase Auth
 * lalu memvalidasi role dan status dari database.
 * Gunakan di setiap server component / server action yang butuh auth.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        avatarUrl: true,
      },
    })

    if (!dbUser) return null
    if (dbUser.status === UserStatus.SUSPENDED) return null

    return dbUser
  } catch {
    return null
  }
}

/**
 * Require auth + role check. Redirect jika tidak sesuai.
 */
export async function requireAuth(
  allowedRoles: UserRole[],
  redirectTo = '/login'
): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) redirect(redirectTo)
  if (!allowedRoles.includes(user.role)) {
    // Redirect ke halaman sesuai role
    if (user.role === UserRole.ADMIN) redirect('/admin')
    if (user.role === UserRole.PETANI) redirect('/mitra')
    redirect('/')
  }
  return user
}
