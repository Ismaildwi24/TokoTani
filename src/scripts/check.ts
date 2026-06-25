import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const settings = await prisma.platformSetting.findMany()
  console.log("Settings:", settings)

  const ledgers = await prisma.petaniLedger.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  
  console.log("Recent Ledgers:", ledgers)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
