import type { Metadata } from 'next'
import { AdminStatistikView } from '@/components/dashboard/admin-statistik-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Statistik Distribusi',
  description: 'Statistik distribusi pangan dan pengurangan emisi karbon platform.',
})

export default function AdminStatsPage() {
  return <AdminStatistikView />
}
