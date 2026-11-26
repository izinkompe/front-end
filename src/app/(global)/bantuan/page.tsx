import type { Metadata } from 'next'
import { InfoCenterView } from '@/components/info/info-center-view'
import { JsonLd } from '@/components/seo/json-ld'
import { buildBreadcrumbJsonLd, buildPublicMetadata, buildWebPageJsonLd } from '@/lib/seo'

const pageTitle = 'Pusat Bantuan'
const pageDescription =
  'Panduan pemesanan, pembayaran transfer manual, pengambilan panen di kebun, dan pengaduan.'

export const metadata: Metadata = buildPublicMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/bantuan',
  keywords: ['pusat bantuan PanganTani', 'cara pesan panen', 'panduan ambil mandiri'],
})

export default function HelpPage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          name: pageTitle,
          description: pageDescription,
          path: '/bantuan',
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Beranda', path: '/' },
          { name: pageTitle, path: '/bantuan' },
        ])}
      />
      <InfoCenterView activeTab='bantuan' />
    </>
  )
}
