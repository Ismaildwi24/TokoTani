'use client'

import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

export default function LogoutButtonClient() {
  return (
    <button
      id="logout-btn"
      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition-colors group"
      onClick={async () => {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/login'
      }}
    >
      <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-500" />
      <span className="flex-1 text-sm font-medium text-red-500 text-left">Keluar Akun</span>
    </button>
  )
}
