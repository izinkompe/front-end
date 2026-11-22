import type { Metadata } from 'next'
import { DashboardLayout as DashboardLayoutComponent } from '@/components/layout/dashboard-layout'

export const metadata: Metadata = {
  title: 'Dashboard | PanganTani',
  description: 'Panel Pengelolaan Agrikultur dan Pangan PanganTani',
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>
}
