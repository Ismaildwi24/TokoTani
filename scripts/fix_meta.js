const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = "admin@gmail.com"
  
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error("User not found in public.User")
    process.exit(1)
  }

  // Update auth.users directly via raw SQL
  await prisma.$executeRaw`
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || '{"role":"ADMIN"}'::jsonb
    WHERE email = ${email}
  `
  
  console.log("Updated raw_user_meta_data in auth.users")
}

main().catch(console.error).finally(() => prisma.$disconnect())
