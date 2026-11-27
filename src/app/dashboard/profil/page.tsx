import type { Metadata } from 'next'
import { DashboardProfileView } from '@/components/dashboard/dashboard-profile-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Data Profil',
  description: 'Kelola informasi nama, kontak, dan foto profil akun mitra PanganTani.',
})

export default function DashboardProfilePage() {
  return <DashboardProfileView />
}
