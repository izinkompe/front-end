import type { Metadata } from 'next'
import { AccountSettingsView } from '@/components/account/account-settings-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Pengaturan Akun',
  description: 'Atur preferensi notifikasi, keamanan, dan konfigurasi akun PanganTani Anda.',
})

export default function AccountSettingsPage() {
  return <AccountSettingsView />
}
