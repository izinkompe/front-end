import { Suspense } from 'react'
import type { Metadata } from 'next'
import { FarmerFarmFormView } from '@/components/dashboard/farmer/farmer-farm-form'
import { Skeleton } from '@/components/ui/skeleton'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Sunting Kebun',
  description: 'Pembaruan data kebun dan lokasi pengambilan panen petani.',
})

async function EditFarmerFarmContent({ params }: { params: Promise<{ farmId: string }> }) {
  const { farmId } = await params
  return <FarmerFarmFormView farmId={decodeURIComponent(farmId)} />
}

export default function EditFarmerFarmPage({ params }: { params: Promise<{ farmId: string }> }) {
  return (
    <Suspense fallback={<Skeleton className='h-96 max-w-3xl' />}>
      <EditFarmerFarmContent params={params} />
    </Suspense>
  )
}
