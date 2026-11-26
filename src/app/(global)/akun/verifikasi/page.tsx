import type { Metadata } from 'next'
import { AccountVerificationView } from '@/components/account/account-verification-view'

export const metadata: Metadata = {
  title: 'Kontak & Verifikasi | PanganTani',
}

export default function AccountVerificationPage() {
  return <AccountVerificationView />
}
