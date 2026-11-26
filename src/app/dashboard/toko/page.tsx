import type { Metadata } from 'next'
import { FarmerStoreView } from '@/components/dashboard/farmer-store-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Toko Saya',
  description: 'Pengaturan profil toko publik petani PanganTani.',
})

export default function FarmerStoreDashboardPage() {
  return <FarmerStoreView />
}
