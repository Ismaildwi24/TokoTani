import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import UploadPanenClient from '@/components/petani/UploadPanenClient'

export default async function UploadPanenPage() {
  const user = await requireAuth([UserRole.PETANI])

  // Cek apakah petani sudah diverifikasi
  const petani = await prisma.petaniProfile.findUnique({
    where: { userId: user.id },
  })

  if (!petani || petani.verificationStatus !== 'ACTIVE') {
    redirect('/mitra?error=not_verified')
  }

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  return <UploadPanenClient categories={categories} />
}
