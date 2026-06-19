const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testUpload() {
  const buffer = Buffer.from('test data')
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload('test.txt', buffer, { upsert: true, contentType: 'text/plain' })
  
  if (error) {
    console.error('Upload error:', error)
  } else {
    console.log('Upload success:', data)
  }
}

testUpload()
