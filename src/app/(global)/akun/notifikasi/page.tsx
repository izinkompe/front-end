import type { Metadata } from 'next'
import { AccountNotificationsView } from '@/components/account/account-notifications-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Notifikasi',
  description:
    'Pusat pembaruan status pesanan, verifikasi pembayaran, dan informasi akun PanganTani.',
})

export default function AccountNotificationsPage() {
  return <AccountNotificationsView />
}
