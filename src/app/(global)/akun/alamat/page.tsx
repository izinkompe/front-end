import type { Metadata } from 'next'
import { AccountAddressesView } from '@/components/account/account-addresses-view'

export const metadata: Metadata = {
  title: 'Alamat Tersimpan | PanganTani',
}

export default function AccountAddressesPage() {
  return <AccountAddressesView />
}
