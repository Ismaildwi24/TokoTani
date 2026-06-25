import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.petaniLedger.delete({
    where: { id: '77e4f554-d0c4-47bf-8cb7-129ed11a5c13' }
  })
  console.log("Deleted orphaned ledger")
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
