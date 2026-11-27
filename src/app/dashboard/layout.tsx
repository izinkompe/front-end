import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Skeleton } from '@/components/ui/skeleton'
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
  return (
    <Suspense fallback={<Skeleton className='min-h-dvh w-full' />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  )
}
