import type { Metadata } from 'next'
import { InfoCenterView } from '@/components/info/info-center-view'
import { JsonLd } from '@/components/seo/json-ld'
import { buildBreadcrumbJsonLd, buildPublicMetadata, buildWebPageJsonLd } from '@/lib/seo'

const pageTitle = 'Kebijakan Privasi'
const pageDescription =
  'Kebijakan privasi mengenai pengelolaan data akun, transaksi, bukti pembayaran, dan preferensi peramban.'

export const metadata: Metadata = buildPublicMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/privasi',
})

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          name: pageTitle,
          description: pageDescription,
          path: '/privasi',
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Beranda', path: '/' },
          { name: pageTitle, path: '/privasi' },
        ])}
      />
      <InfoCenterView activeTab='kebijakan-privasi' />
    </>
  )
}
