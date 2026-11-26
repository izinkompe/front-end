import type { Metadata } from 'next'
import { AccountSettingsView } from '@/components/account/account-settings-view'

export const metadata: Metadata = {
  title: 'Pengaturan Akun | PanganTani',
}

export default function AccountSettingsPage() {
  return <AccountSettingsView />
}
