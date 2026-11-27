import { Suspense } from 'react'
import type { Metadata } from 'next'
import { FarmerOfferFormView } from '@/components/dashboard/farmer/farmer-offer-form'
import { Skeleton } from '@/components/ui/skeleton'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Buat Penawaran Panen',
  description: 'Formulir pembuatan penawaran panen surplus petani.',
})

async function NewFarmerOfferContent({
  searchParams,
}: {
  searchParams: Promise<{ copyFrom?: string }>
}) {
  const { copyFrom } = await searchParams
  return <FarmerOfferFormView copyFromOfferId={copyFrom} />
}

export default function NewFarmerOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ copyFrom?: string }>
}) {
  return (
    <Suspense fallback={<Skeleton className='h-96 max-w-4xl' />}>
      <NewFarmerOfferContent searchParams={searchParams} />
    </Suspense>
  )
}
