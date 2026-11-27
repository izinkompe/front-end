import type { Metadata } from 'next'
import { FarmerFarmFormView } from '@/components/dashboard/farmer/farmer-farm-form'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Tambah Kebun Baru',
  description: 'Pendaftaran kebun dan lokasi pengambilan panen petani.',
})

export default function NewFarmerFarmPage() {
  return <FarmerFarmFormView />
}
