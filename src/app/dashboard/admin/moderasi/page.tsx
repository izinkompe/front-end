import type { Metadata } from 'next'
import { AdminModerasiView } from '@/components/dashboard/admin-moderasi-view'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Moderasi Penawaran',
  description: 'Moderasi penawaran hasil panen dan tindak lanjut laporan kualitas.',
})

export default function AdminModerationPage() {
  return <AdminModerasiView />
}
