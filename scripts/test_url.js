const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const bucket = 'product-images'
const filename = 'test.txt'
const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename)
console.log(urlData.publicUrl)
