import type { Metadata } from 'next'
import { InfoCenterView } from '@/components/info/info-center-view'
import { JsonLd } from '@/components/seo/json-ld'
import { buildBreadcrumbJsonLd, buildPublicMetadata, buildWebPageJsonLd } from '@/lib/seo'

const pageTitle = 'Aksesibilitas'
const pageDescription =
  'Pengaturan aksesibilitas tampilan PanganTani yang tersimpan di peramban pengguna.'

export const metadata: Metadata = buildPublicMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/aksesibilitas',
})

export default function AccessibilityPage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          name: pageTitle,
          description: pageDescription,
          path: '/aksesibilitas',
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Beranda', path: '/' },
          { name: pageTitle, path: '/aksesibilitas' },
        ])}
      />
      <InfoCenterView activeTab='aksesibilitas' />
    </>
  )
}
