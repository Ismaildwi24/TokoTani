import { Metadata } from 'next'
import { requireAuth } from '@/lib/auth-guard'
import { UserRole } from '@prisma/client'
import EditProfilClient from '@/components/customer/EditProfilClient'

import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Edit Profil Mitra — Toko Tani' }

export default async function MitraEditProfilPage() {
  const user = await requireAuth([UserRole.PETANI])
  const petaniProfile = await prisma.petaniProfile.findUnique({
    where: { userId: user.id }
  })
  
  return <EditProfilClient user={user as any} petaniProfile={petaniProfile} returnPath="/mitra" />
}
