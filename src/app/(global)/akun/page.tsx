import type { Metadata } from 'next'
import { AccountOrdersView } from '@/components/account/account-orders-view'

export const metadata: Metadata = {
  title: 'Pesanan Saya | PanganTani',
}

export default function AccountOrdersPage() {
  return <AccountOrdersView />
}
