import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import PembayaranClient from '@/components/customer/PembayaranClient'

export const metadata = {
  title: 'Metode Pembayaran Tersimpan | Toko Tani',
}

export default async function PembayaranPage() {
  const authUser = await requireAuth([UserRole.CUSTOMER, UserRole.PETANI, UserRole.ADMIN])

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, fullName: true }
  })

  const methods = await prisma.savedPaymentMethod.findMany({
    where: { userId: authUser.id },
    orderBy: { isDefault: 'desc' }
  })

  if (!user) return null

  return <PembayaranClient initialMethods={methods as any} user={user} />
}
