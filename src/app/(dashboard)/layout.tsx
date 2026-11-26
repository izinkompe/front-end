import type { Metadata } from 'next'
import { DashboardLayout as DashboardLayoutComponent } from '@/components/layout/dashboard-layout'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Dashboard',
  description: 'Panel Pengelolaan Agrikultur dan Pangan PanganTani.',
})

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>
}
