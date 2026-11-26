import type { Metadata } from 'next'
import { AccountVerificationView } from '@/components/account/account-verification-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Kontak & Verifikasi',
  description: 'Kelola status verifikasi kontak dan keamanan akun pembeli PanganTani.',
})

export default function AccountVerificationPage() {
  return <AccountVerificationView />
}
