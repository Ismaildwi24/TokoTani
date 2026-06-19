import { requireAuth } from '@/lib/auth-guard'
import { UserRole } from '@prisma/client'
import CustomerChatClient from '@/components/chat/CustomerChatClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pesan Mitra | Toko Tani',
}

export default async function MitraChatPage() {
  const user = await requireAuth([UserRole.PETANI])

  return <CustomerChatClient userId={user.id} isMitra={true} />
}
