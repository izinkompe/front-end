import type { Metadata } from 'next'
import { AccountAddressesView } from '@/components/account/account-addresses-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Alamat Tersimpan',
  description: 'Kelola daftar alamat utama dan titik referensi lokasi pembeli di PanganTani.',
})

export default function AccountAddressesPage() {
  return <AccountAddressesView />
}
