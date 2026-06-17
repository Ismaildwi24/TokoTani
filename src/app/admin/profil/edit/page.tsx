import { Metadata } from 'next'
import { requireAuth } from '@/lib/auth-guard'
import { UserRole } from '@prisma/client'
import EditProfilClient from '@/components/customer/EditProfilClient'

export const metadata: Metadata = { title: 'Edit Profil Admin — Toko Tani' }

export default async function AdminEditProfilPage() {
  const user = await requireAuth([UserRole.ADMIN])
  return <EditProfilClient user={user as any} returnPath="/admin" />
}
