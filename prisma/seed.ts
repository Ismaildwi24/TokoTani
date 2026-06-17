import { PrismaClient, UserRole, UserStatus, Gender } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  // 1. Platform Settings
  await prisma.platformSetting.upsert({
    where: { key: 'commission_percentage' },
    update: {},
    create: { key: 'commission_percentage', value: '3.5' },
  })

  // 2. Categories
  const categories = [
    { name: 'Sayuran', slug: 'sayuran' },
    { name: 'Buah', slug: 'buah' },
    { name: 'Bumbu & Rempah', slug: 'bumbu' },
    { name: 'Beras & Biji', slug: 'biji' },
  ]
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  // Find sayuran category
  const sayuranCat = await prisma.category.findUnique({ where: { slug: 'sayuran' } })
  const buahCat = await prisma.category.findUnique({ where: { slug: 'buah' } })

  // 3. Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tokotani.com' },
    update: {},
    create: {
      email: 'admin@tokotani.com',
      fullName: 'Super Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  })

  // 4. Petani User
  const petani = await prisma.user.upsert({
    where: { email: 'petani@tokotani.com' },
    update: {},
    create: {
      email: 'petani@tokotani.com',
      fullName: 'Pak Sudarso',
      role: UserRole.PETANI,
      status: UserStatus.ACTIVE,
      petaniProfile: {
        create: {
          farmName: 'Kebun Makmur Jaya',
          location: 'Lembang, Bandung Barat',
          bio: 'Petani sayur organik tersertifikasi sejak 2010.',
          verificationStatus: UserStatus.ACTIVE,
        },
      },
    },
  })

  // 5. Customer User
  const customer = await prisma.user.upsert({
    where: { email: 'customer@tokotani.com' },
    update: {},
    create: {
      email: 'customer@tokotani.com',
      fullName: 'Budi Santoso',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      phone: '081234567890',
      gender: Gender.LAKI_LAKI,
      addresses: {
        create: {
          label: 'Rumah',
          recipientName: 'Budi Santoso',
          phone: '081234567890',
          fullAddress: 'Jl. Merdeka No. 45, RT 01/RW 02',
          city: 'Bandung',
          province: 'Jawa Barat',
          postalCode: '40111',
          isDefault: true,
        },
      },
    },
  })

  // 6. Dummy Products
  if (sayuranCat && buahCat) {
    const existingProducts = await prisma.product.count()
    if (existingProducts === 0) {
      await prisma.product.create({
        data: {
          petaniId: petani.id,
          categoryId: sayuranCat.id,
          name: 'Bayam Hijau Segar Organik',
          description: 'Dipanen langsung dari kebun pagi ini. Sangat segar dan tanpa pestisida kimia.',
          price: 5000,
          unit: 'ikat',
          stock: 50,
          isOrganic: true,
          isPesticideFree: true,
          isFeatured: true,
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80', sortOrder: 0 },
            ],
          },
        },
      })
      await prisma.product.create({
        data: {
          petaniId: petani.id,
          categoryId: buahCat.id,
          name: 'Tomat Cherry Manis',
          description: 'Tomat cherry kualitas premium cocok untuk salad.',
          price: 15000,
          unit: '250g',
          stock: 30,
          isOrganic: false,
          isPesticideFree: true,
          isFeatured: true,
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80', sortOrder: 0 },
            ],
          },
        },
      })
      await prisma.product.create({
        data: {
          petaniId: petani.id,
          categoryId: sayuranCat.id,
          name: 'Wortel Brastagi',
          description: 'Wortel manis dan renyah dari pegunungan.',
          price: 12000,
          unit: '1 kg',
          stock: 100,
          isOrganic: false,
          isPesticideFree: false,
          isFeatured: true,
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80', sortOrder: 0 },
            ],
          },
        },
      })
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
