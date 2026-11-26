import type { Metadata } from 'next'
import { FarmerFarmsView } from '@/components/dashboard/farmer-farms-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Kebun Saya',
  description: 'Pengelolaan daftar kebun dan titik pengambilan panen petani.',
})

export default function FarmerFarmsDashboardPage() {
  return <FarmerFarmsView />
}
