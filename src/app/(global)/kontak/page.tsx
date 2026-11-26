import type { Metadata } from 'next'
import { InfoCenterView } from '@/components/info/info-center-view'
import { JsonLd } from '@/components/seo/json-ld'
import { buildBreadcrumbJsonLd, buildPublicMetadata, buildWebPageJsonLd } from '@/lib/seo'

const pageTitle = 'Kontak'
const pageDescription =
  'Kanal resmi untuk pertanyaan pesanan, verifikasi transfer, pengaduan, dan kemitraan petani PanganTani.'

export const metadata: Metadata = buildPublicMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/kontak',
  keywords: ['kontak PanganTani', 'layanan pembeli', 'kemitraan petani'],
})

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          name: pageTitle,
          description: pageDescription,
          path: '/kontak',
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Beranda', path: '/' },
          { name: pageTitle, path: '/kontak' },
        ])}
      />
      <InfoCenterView activeTab='kontak' />
    </>
  )
}
