import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CatalogLoadingSkeleton } from '@/components/catalog/catalog-loading-skeleton'
import { CatalogView } from '@/components/catalog/catalog-view'

export const metadata: Metadata = {
  title: 'Eksplorasi Panen Surplus | PanganTani',
  description:
    'Jelajahi penawaran panen surplus per kilogram dengan sistem ambil mandiri langsung dari petani terdekat.',
}

export default function PasarPage() {
  return (
    <Suspense fallback={<CatalogLoadingSkeleton />}>
      <CatalogView />
    </Suspense>
  )
}
