import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Memulai proses penghapusan data transaksi dan produk...')

  // Delete in reverse order of dependencies to avoid foreign key constraints
  await prisma.report.deleteMany()
  console.log('- Reports terhapus')

  await prisma.notification.deleteMany()
  console.log('- Notifications terhapus')
  
  await prisma.chatMessage.deleteMany()
  await prisma.chatConversation.deleteMany()
  console.log('- Chats terhapus')
  
  await prisma.review.deleteMany()
  console.log('- Reviews terhapus')
  
  await prisma.petaniLedger.deleteMany()
  await prisma.withdrawalRequest.deleteMany()
  console.log('- Keuangan & Withdrawal terhapus')
  
  await prisma.orderItem.deleteMany()
  await prisma.orderSeller.deleteMany()
  await prisma.order.deleteMany()
  console.log('- Pesanan (Orders) terhapus')
  
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  console.log('- Keranjang belanja terhapus')
  
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  console.log('- Produk & Gambar terhapus')

  console.log('\n✅ Semua data transaksi dan produk berhasil dibersihkan!')
  console.log('✅ Data User, PetaniProfile, Alamat, dan Pengaturan Pembayaran TETAP dipertahankan.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
