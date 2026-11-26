import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { BuyerOrderAccess } from '@/components/checkout/buyer-order-access'
import { CheckoutSkeleton } from '@/components/checkout/checkout-skeleton'
import { OrderPaymentView } from '@/components/checkout/order-payment-view'

const OrderIdParamSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/)

export const metadata: Metadata = {
  title: 'Pembayaran Pesanan | PanganTani',
  description: 'Instruksi transfer bank manual dan unggah bukti pembayaran pesanan panen.',
}

interface OrderPaymentPageProps {
  params: Promise<{ orderId: string }>
}

async function OrderPaymentContent({ params }: OrderPaymentPageProps) {
  const { orderId } = await params
  const parsed = OrderIdParamSchema.safeParse(orderId)
  if (!parsed.success) {
    notFound()
  }

  return (
    <BuyerOrderAccess>
      <OrderPaymentView orderId={parsed.data} />
    </BuyerOrderAccess>
  )
}

export default function OrderPaymentPage({ params }: OrderPaymentPageProps) {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <OrderPaymentContent params={params} />
    </Suspense>
  )
}
