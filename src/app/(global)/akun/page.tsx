import type { Metadata } from 'next'
import { AccountOrdersView } from '@/components/account/account-orders-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Pesanan Saya',
  description: 'Pantau status reservasi, pembayaran, dan pengambilan mandiri pesanan panen Anda.',
})

export default function AccountOrdersPage() {
  return <AccountOrdersView />
}
