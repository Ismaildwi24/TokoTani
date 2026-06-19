const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function setupStoragePolicy() {
  try {
    // Drop existing if exists to avoid error
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;`)
    
    // Create policy for INSERT
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Allow authenticated uploads"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'product-images' OR 
        bucket_id = 'profile-photos' OR 
        bucket_id = 'payment-proofs' OR 
        bucket_id = 'chat-attachments'
      );
    `)

    // Create policy for UPDATE
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;`)
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Allow authenticated updates"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'product-images' OR 
        bucket_id = 'profile-photos' OR 
        bucket_id = 'payment-proofs' OR 
        bucket_id = 'chat-attachments'
      );
    `)
    
    // Create policy for SELECT
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;`)
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Allow public reads"
      ON storage.objects
      FOR SELECT
      TO public
      USING (
        bucket_id = 'product-images' OR 
        bucket_id = 'profile-photos' OR 
        bucket_id = 'payment-proofs' OR 
        bucket_id = 'chat-attachments'
      );
    `)
    console.log('Storage policies created successfully!')
  } catch (error) {
    console.error('Error creating storage policies:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupStoragePolicy()
