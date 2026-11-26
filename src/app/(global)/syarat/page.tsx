import type { Metadata } from 'next'
import { TermsOfUseView } from '@/components/info/terms-of-use-view'
import { JsonLd } from '@/components/seo/json-ld'
import { buildBreadcrumbJsonLd, buildPublicMetadata, buildWebPageJsonLd } from '@/lib/seo'

const pageTitle = 'Syarat dan Ketentuan'
const pageDescription =
  'Syarat, ketentuan, dan pemberitahuan penggunaan layanan PanganTani untuk pembeli dan petani mitra.'

export const metadata: Metadata = buildPublicMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/syarat',
})

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          name: pageTitle,
          description: pageDescription,
          path: '/syarat',
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Beranda', path: '/' },
          { name: pageTitle, path: '/syarat' },
        ])}
      />
      <TermsOfUseView />
    </>
  )
}
