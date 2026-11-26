import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CheckoutReservationView } from '@/components/checkout/checkout-reservation-view'
import { CheckoutSkeleton } from '@/components/checkout/checkout-skeleton'

export const metadata: Metadata = {
  title: 'Konfirmasi Checkout | PanganTani',
  description: 'Tinjau berat pesanan, jadwal ambil mandiri, dan buat reservasi stok panen.',
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutReservationView />
    </Suspense>
  )
}
