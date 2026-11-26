import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NeedsBoardView } from '@/components/needs-board/needs-board-view'
import { JsonLd } from '@/components/seo/json-ld'
import { Skeleton } from '@/components/ui/skeleton'
import { buildBreadcrumbJsonLd, buildPublicMetadata, buildWebPageJsonLd } from '@/lib/seo'

const pageTitle = 'Papan Kebutuhan Pangan'
const pageDescription =
  'Daftar permintaan komoditas pangan dari pembeli, katering, dan UMKM agar petani mitra dapat menyalurkan panen sesuai kebutuhan.'

export const metadata: Metadata = buildPublicMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/papan-kebutuhan',
  keywords: ['papan kebutuhan pangan', 'permintaan komoditas petani', 'kolaborasi panen'],
})

export default function NeedsBoardPage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          name: pageTitle,
          description: pageDescription,
          path: '/papan-kebutuhan',
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Beranda', path: '/' },
          { name: pageTitle, path: '/papan-kebutuhan' },
        ])}
      />
      <Suspense fallback={<Skeleton className='mx-auto my-8 h-64 w-full max-w-7xl' />}>
        <NeedsBoardView />
      </Suspense>
    </>
  )
}
