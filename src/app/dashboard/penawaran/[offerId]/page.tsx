import { Suspense } from 'react'
import type { Metadata } from 'next'
import { FarmerOfferFormView } from '@/components/dashboard/farmer/farmer-offer-form'
import { Skeleton } from '@/components/ui/skeleton'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Sunting Penawaran Panen',
  description: 'Formulir pembaruan harga, stok, dan jadwal penawaran panen.',
})

async function EditFarmerOfferContent({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params
  return <FarmerOfferFormView offerId={decodeURIComponent(offerId)} />
}

export default function EditFarmerOfferPage({ params }: { params: Promise<{ offerId: string }> }) {
  return (
    <Suspense fallback={<Skeleton className='h-96 max-w-4xl' />}>
      <EditFarmerOfferContent params={params} />
    </Suspense>
  )
}
