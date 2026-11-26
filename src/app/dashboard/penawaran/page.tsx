import type { Metadata } from 'next'
import { FarmerOffersView } from '@/components/dashboard/farmer-offers-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Penawaran Panen',
  description: 'Pengelolaan daftar penawaran panen surplus petani.',
})

export default function FarmerOffersDashboardPage() {
  return <FarmerOffersView />
}
