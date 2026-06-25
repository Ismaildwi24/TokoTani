import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { PaymentMethod, PaymentStatus, OrderSellerStatus } from '@prisma/client'
import { midtrans } from '@/lib/midtrans'

// Generate kode order TT-XXXX
function generateOrderCode() {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `TT-${num}`
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { addresses: { where: { isDefault: true }, take: 1 } },
  })
  if (!dbUser || dbUser.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { itemIds, paymentMethod, paymentChannel } = await request.json()
  if (!itemIds?.length || !paymentMethod) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  const defaultAddress = dbUser.addresses[0]
  if (!defaultAddress) {
    return NextResponse.json({ error: 'Alamat pengiriman belum diset' }, { status: 400 })
  }

  // Ambil cart items yang dipilih
  const cartItems = await prisma.cartItem.findMany({
    where: { id: { in: itemIds }, cart: { userId: user.id } },
    include: {
      product: { include: { petani: true } },
    },
  })

  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'Tidak ada item yang valid' }, { status: 400 })
  }

  // Hitung total dari database (tidak percaya client)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price as unknown as string) * item.quantity,
    0
  )

  // Kelompokkan per petani
  const byPetani = new Map<string, typeof cartItems>()
  cartItems.forEach((item) => {
    const petaniId = item.product.petaniId
    if (!byPetani.has(petaniId)) byPetani.set(petaniId, [])
    byPetani.get(petaniId)!.push(item)
  })

  // Buat Order dalam transaksi
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderCode: generateOrderCode(),
        customerId: user.id,
        shippingAddressId: defaultAddress.id,
        paymentMethod: paymentMethod as PaymentMethod,
        midtransPaymentType: paymentChannel,
        paymentStatus: PaymentStatus.PENDING,
        subtotal,
        totalShippingCost: 0,
        total: subtotal, // Ongkir ditambahkan setelah petani pilih kurir
        orderSellers: {
          create: Array.from(byPetani.entries()).map(([petaniId, items]) => ({
            petaniId,
            status: OrderSellerStatus.MENUNGGU_PEMBAYARAN,
            items: {
              create: items.map((i) => ({
                productId: i.productId,
                productNameSnapshot: i.product.name,
                priceSnapshot: i.product.price,
                quantity: i.quantity,
                subtotal: parseFloat(i.product.price as unknown as string) * i.quantity,
              })),
            },
          })),
        },
      },
    })

    // Kurangi stok
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    // Hapus dari cart
    await tx.cartItem.deleteMany({ where: { id: { in: itemIds } } })

    return newOrder
  })

  // Jika Midtrans, buat transaksi
  if (paymentMethod === 'MIDTRANS') {
    try {
      const itemDetails = cartItems.map(item => ({
        id: item.product.name.slice(0, 50),
        name: item.product.name,
        price: parseFloat(item.product.price as unknown as string),
        quantity: item.quantity,
      }))

      const midtransOrderId = `TT-${order.orderCode}-${Date.now()}`
      
      const snapToken = await midtrans.createTransaction({
        transaction_details: {
          order_id: midtransOrderId,
          gross_amount: subtotal,
        },
        item_details: itemDetails,
        customer_details: {
          first_name: dbUser.fullName,
          email: dbUser.email,
          phone: dbUser.phone || '',
        },
      } as any)

      await prisma.order.update({
        where: { id: order.id },
        data: { midtransOrderId },
      })

      return NextResponse.json({
        orderId: order.id,
        snapToken: snapToken.token,
      })
    } catch (error: any) {
      console.error('Midtrans Checkout Error:', error)
      // fallback — return orderId tetap
    }
  }

  return NextResponse.json({ orderId: order.id })
}
