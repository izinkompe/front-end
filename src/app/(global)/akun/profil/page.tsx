import type { Metadata } from 'next'
import { AccountProfileForm } from '@/components/account/account-profile-form'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Data Profil',
  description: 'Perbarui informasi nama, kontak, dan preferensi akun pembeli PanganTani.',
})

export default function AccountProfilePage() {
  return <AccountProfileForm />
}
