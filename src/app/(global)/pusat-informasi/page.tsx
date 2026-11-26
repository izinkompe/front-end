import type { Metadata } from 'next'
import { Suspense } from 'react'
import { resolveInfoCenterTab } from '@/components/info/info-center-data'
import { InfoCenterView } from '@/components/info/info-center-view'

export const metadata: Metadata = {
  title: 'Pusat Informasi | PanganTani',
  description:
    'Pusat Bantuan, Syarat dan Ketentuan, Kebijakan Privasi, dan pengaturan Aksesibilitas PanganTani.',
}

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
    <Suspense fallback={<InfoCenterView activeTab='bantuan' />}>
      <InfoCenterContent searchParams={searchParams} />
    </Suspense>
  )
}
