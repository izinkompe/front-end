import type { Metadata } from 'next'
import { FarmerOrdersView } from '@/components/dashboard/farmer-orders-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Pesanan Masuk',
  description: 'Pengelolaan pesanan ambil mandiri dari pembeli.',
})

export default function FarmerOrdersDashboardPage() {
  return <FarmerOrdersView />
}
