import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CatalogLoadingSkeleton } from '@/components/catalog/catalog-loading-skeleton'
import { CatalogView } from '@/components/catalog/catalog-view'
import { JsonLd } from '@/components/seo/json-ld'
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildPublicMetadata } from '@/lib/seo'

const pageTitle = 'Eksplorasi Panen Surplus'
const pageDescription =
  'Jelajahi penawaran panen surplus per kilogram dengan sistem ambil mandiri langsung dari petani terdekat.'

export const metadata: Metadata = buildPublicMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/pasar',
  keywords: ['pasar panen surplus', 'katalog hasil tani', 'beli panen per kilogram'],
})

export default function PasarPage() {
  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: pageTitle,
          description: pageDescription,
          path: '/pasar',
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Beranda', path: '/' },
          { name: 'Pasar Panen', path: '/pasar' },
        ])}
      />
      <Suspense fallback={<CatalogLoadingSkeleton />}>
        <CatalogView />
      </Suspense>
    </>
  )
}
