import type { Metadata } from 'next'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Dashboard Pengelolaan',
  description: 'Dashboard pengelolaan untuk petani dan admin operasional PanganTani.',
})

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <DashboardShell>{children}</DashboardShell>
}
