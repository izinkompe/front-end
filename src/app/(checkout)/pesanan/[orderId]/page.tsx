import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { BuyerOrderAccess } from '@/components/checkout/buyer-order-access'
import { CheckoutSkeleton } from '@/components/checkout/checkout-skeleton'
import { OrderDetailView } from '@/components/order-detail/order-detail-view'

const OrderIdParamSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/)

export const metadata: Metadata = {
  title: 'Detail Pesanan | PanganTani',
  description:
    'Ringkasan status, lokasi pengambilan, alamat pembeli, dan rincian pembayaran pesanan.',
}

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>
}

async function OrderDetailContent({ params }: OrderDetailPageProps) {
  const { orderId } = await params
  const parsed = OrderIdParamSchema.safeParse(orderId)
  if (!parsed.success) {
    notFound()
  }

  return (
    <BuyerOrderAccess>
      <OrderDetailView orderId={parsed.data} />
    </BuyerOrderAccess>
  )
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <OrderDetailContent params={params} />
    </Suspense>
  )
}
