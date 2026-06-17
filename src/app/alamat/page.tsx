import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import AlamatClient from '@/components/customer/AlamatClient'

export const metadata = {
  title: 'Daftar Alamat Pengiriman | Toko Tani',
}

export default async function AlamatPage() {
  const authUser = await requireAuth()

  // Ambil profil user untuk fullName
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, fullName: true }
  })

  // Ambil semua alamat user
  const addresses = await prisma.address.findMany({
    where: { userId: authUser.id },
    orderBy: { isDefault: 'desc' }
  })

  if (!user) return null

  return <AlamatClient initialAddresses={addresses as any} user={user} />
}
