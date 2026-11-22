import type { Metadata } from 'next'
import { GlobalLayout as GlobalLayoutComponent } from '@/components/layout/global-layout'

export const metadata: Metadata = {
  title: 'PanganTani',
  description: 'Platform Kolaborasi Agrikultur dan Pangan Berkelanjutan',
}

export default function GlobalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <GlobalLayoutComponent>{children}</GlobalLayoutComponent>
}
