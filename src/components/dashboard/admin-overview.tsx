'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDistributionStats } from '@/hooks/api/use-admin'
import type { User } from '@/types/api/auth'

interface AdminOverviewProps {
  user?: User | null
}

const ADMIN_MODULES = [
  {
    title: 'Verifikasi Petani',
    href: '/dashboard/admin/verifikasi',
    actionLabel: 'Buka antrean verifikasi',
  },
  {
    title: 'Moderasi Penawaran',
    href: '/dashboard/admin/moderasi',
    actionLabel: 'Buka moderasi',
  },
  {
    title: 'Statistik Distribusi',
    href: '/dashboard/admin/statistik',
    actionLabel: 'Lihat statistik',
  },
  {
    title: 'Pengguna & Akses',
    href: '/dashboard/admin/pengguna',
    actionLabel: 'Kelola pengguna',
  },
] as const

export function AdminOverview({ user }: AdminOverviewProps) {
  const { data: stats, isLoading, isError } = useDistributionStats()
  const displayName = user?.name ?? 'Admin Operasional'

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='type-h1 font-semibold text-foreground'>Operasional PanganTani</h1>
          <p className='text-base text-muted-foreground'>Masuk sebagai {displayName}</p>
        </div>
        <Button nativeButton={false} render={<Link href='/dashboard/admin/verifikasi' />}>
          Tinjau verifikasi
        </Button>
      </div>

      {isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>
            Gagal memuat ringkasan statistik distribusi. Periksa izin peran atau koneksi API.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
        </div>
      ) : (
        stats && (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card className='min-w-0'>
              <CardHeader className='pb-2'>
                <CardDescription>Pangan terselamatkan</CardDescription>
                <CardTitle className='type-kpi font-mono tabular-nums'>
                  {stats.totalRescuedFoodKg.toLocaleString('id-ID')} kg
                </CardTitle>
              </CardHeader>
              <CardContent className='text-meta text-muted-foreground'>
                Total distribusi {stats.totalDistributedWeightKg.toLocaleString('id-ID')} kg
              </CardContent>
            </Card>
            <Card className='min-w-0'>
              <CardHeader>
                <CardDescription>Pengurangan emisi karbon</CardDescription>
                <CardTitle className='type-kpi font-mono tabular-nums'>
                  {stats.totalCarbonSavedKgCo2e.toLocaleString('id-ID')} kg CO2e
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className='min-w-0'>
              <CardHeader className='pb-2'>
                <CardDescription>Petani aktif</CardDescription>
                <CardTitle className='type-kpi font-mono tabular-nums'>
                  {stats.activeFarmersCount.toLocaleString('id-ID')}
                </CardTitle>
              </CardHeader>
              <CardContent className='text-meta text-muted-foreground'>
                {stats.activeBuyersCount.toLocaleString('id-ID')} pembeli terdaftar
              </CardContent>
            </Card>
            <Card className='min-w-0'>
              <CardHeader>
                <CardDescription>Transaksi selesai</CardDescription>
                <CardTitle className='type-kpi font-mono tabular-nums'>
                  {stats.totalCompletedTransactions.toLocaleString('id-ID')}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )
      )}

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {ADMIN_MODULES.map((item) => (
          <Card key={item.href} className='min-w-0'>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardFooter>
              <Button variant='outline' nativeButton={false} render={<Link href={item.href} />}>
                {item.actionLabel}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
