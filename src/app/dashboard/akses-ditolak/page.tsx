import type { Metadata } from 'next'
import { DashboardAccessDenied } from '@/components/dashboard/role-gate'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Akses Ditolak',
  description: 'Anda tidak memiliki izin peran untuk mengakses halaman dashboard ini.',
})

export default function DashboardAccessDeniedPage() {
  return <DashboardAccessDenied homeHref='/' />
}
