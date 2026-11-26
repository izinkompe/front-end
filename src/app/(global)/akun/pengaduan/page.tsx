import type { Metadata } from 'next'
import { AccountComplaintsView } from '@/components/account/account-complaints-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Pengaduan Saya',
  description: 'Ajukan dan pantau laporan kendala pesanan atau pembayaran di PanganTani.',
})

export default function AccountComplaintsPage() {
  return <AccountComplaintsView />
}
