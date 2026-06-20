import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import AdminOperasionalClient from '@/components/admin/AdminOperasionalClient'

export default async function AdminOperasionalPage() {
  await requireAuth([UserRole.ADMIN])

  const [pendingOrders, users, reports] = await Promise.all([
    // Manual transfer orders pending verification
    prisma.order.findMany({
      where: {
        paymentMethod: 'MANUAL_TRANSFER',
        paymentStatus: 'PENDING',
      },
      include: {
        customer: { select: { fullName: true } },
        orderSellers: {
          include: { petani: { select: { farmName: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
    }),
    // All users
    prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      include: { petaniProfile: { select: { verificationStatus: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    // Open reports
    prisma.report.findMany({
      where: { status: 'OPEN' },
      include: { reporter: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
      take: 20,
    }),
  ])

  return (
    <AdminOperasionalClient
      pendingOrders={pendingOrders as any}
      users={users as any}
      reports={reports as any}
    />
  )
}
