import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FarmerNeedsBoardView } from '@/components/dashboard/farmer-needs-board-view'
import { Skeleton } from '@/components/ui/skeleton'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Papan Kebutuhan',
  description: 'Jelajah permintaan kebutuhan pangan pembeli dan kirim tanggapan penawaran petani.',
})

export default function FarmerNeedsBoardDashboardPage() {
  return (
    <Suspense fallback={<Skeleton className='h-96 w-full' />}>
      <FarmerNeedsBoardView />
    </Suspense>
  )
}
