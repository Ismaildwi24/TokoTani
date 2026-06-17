import { requireAuth } from '@/lib/auth-guard'
import { UserRole } from '@prisma/client'
import EditProfilClient from '@/components/customer/EditProfilClient'

export default async function EditProfilPage() {
  const user = await requireAuth([UserRole.CUSTOMER, UserRole.PETANI, UserRole.ADMIN])
  return <EditProfilClient user={user as any} />
}
