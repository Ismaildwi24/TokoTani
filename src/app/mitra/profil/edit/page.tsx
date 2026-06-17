import { Metadata } from 'next'
import { requireAuth } from '@/lib/auth-guard'
import { UserRole } from '@prisma/client'
import EditProfilClient from '@/components/customer/EditProfilClient'

export const metadata: Metadata = { title: 'Edit Profil Mitra — Toko Tani' }

export default async function MitraEditProfilPage() {
  const user = await requireAuth([UserRole.PETANI])
  return <EditProfilClient user={user as any} returnPath="/mitra" />
}
