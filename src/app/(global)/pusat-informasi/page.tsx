import type { Metadata } from 'next'
import { Suspense } from 'react'
import { resolveInfoCenterTab } from '@/components/info/info-center-data'
import { InfoCenterView } from '@/components/info/info-center-view'
import { JsonLd } from '@/components/seo/json-ld'
import { buildBreadcrumbJsonLd, buildPublicMetadata, buildWebPageJsonLd } from '@/lib/seo'

const pageTitle = 'Pusat Informasi'
const pageDescription =
  'Pusat Bantuan, Syarat dan Ketentuan, Kebijakan Privasi, dan pengaturan Aksesibilitas PanganTani.'

export const metadata: Metadata = buildPublicMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/pusat-informasi',
})

async function InfoCenterContent({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>
}) {
  const params = await searchParams
  const activeTab = resolveInfoCenterTab(params.tab)
  return <InfoCenterView activeTab={activeTab} />
}

export default function InfoCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>
}) {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          name: pageTitle,
          description: pageDescription,
          path: '/pusat-informasi',
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Beranda', path: '/' },
          { name: pageTitle, path: '/pusat-informasi' },
        ])}
      />
      <Suspense fallback={<InfoCenterView activeTab='bantuan' />}>
        <InfoCenterContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}
