import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  const bucket = (formData.get('bucket') as string) || 'profile-photos'

  if (!file) return NextResponse.json({ error: 'File tidak ada' }, { status: 400 })

  // Validate
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return NextResponse.json({ error: 'Format harus .JPEG atau .PNG' }, { status: 400 })
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ukuran maksimal 2 MB' }, { status: 400 })
  }

  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const filename = `${user.id}-${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { upsert: true, contentType: file.type })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename)
  return NextResponse.json({ url: urlData.publicUrl })
}
