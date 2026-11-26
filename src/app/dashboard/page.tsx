import type { Metadata } from 'next'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Ringkasan Dashboard',
  description: 'Ringkasan operasional dan pengelolaan akun mitra PanganTani.',
})

export default function DashboardPage() {
  return <DashboardOverview />
}
