import type { Metadata } from 'next'
import { AccountProfileForm } from '@/components/account/account-profile-form'

export const metadata: Metadata = {
  title: 'Data Profil | PanganTani',
}

export default function AccountProfilePage() {
  return <AccountProfileForm />
}
