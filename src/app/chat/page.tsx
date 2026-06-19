import { requireAuth } from '@/lib/auth-guard'
import CustomerChatClient from '@/components/chat/CustomerChatClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pesan | Toko Tani',
}

export default async function CustomerChatPage() {
  const user = await requireAuth()

  return <CustomerChatClient userId={user.id} isMitra={false} />
}
