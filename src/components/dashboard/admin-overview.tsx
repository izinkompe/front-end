'use client'

import Link from 'next/link'
import { AlertCircle, BarChart3, ClipboardCheck, ShieldCheck, Users } from 'lucide-react'
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
    description: 'Tinjau dokumen identitas, alamat lahan, dan status kelayakan petani.',
    href: '/dashboard/admin/verifikasi',
    actionLabel: 'Buka antrean verifikasi',
    icon: ShieldCheck,
  },
  {
    title: 'Moderasi Penawaran',
    description: 'Periksa kewajaran harga, batas waktu panen, dan laporan kualitas.',
    href: '/dashboard/admin/moderasi',
    actionLabel: 'Buka moderasi',
    icon: ClipboardCheck,
  },
  {
    title: 'Statistik Distribusi',
    description: 'Pantau volume pangan terselamatkan dan estimasi pengurangan emisi karbon.',
    href: '/dashboard/admin/statistik',
    actionLabel: 'Lihat statistik',
    icon: BarChart3,
  },
  {
    title: 'Pengguna & Akses',
    description: 'Kelola akun pembeli, petani, admin, dan kebijakan peran RBAC.',
    href: '/dashboard/admin/pengguna',
    actionLabel: 'Kelola pengguna',
    icon: Users,
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
            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Pangan terselamatkan</CardDescription>
                <CardTitle className='font-mono text-2xl tabular-nums'>
                  {stats.totalRescuedFoodKg.toLocaleString('id-ID')} kg
                </CardTitle>
              </CardHeader>
              <CardContent className='text-xs text-muted-foreground'>
                Total distribusi {stats.totalDistributedWeightKg.toLocaleString('id-ID')} kg
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Pengurangan emisi karbon</CardDescription>
                <CardTitle className='font-mono text-2xl tabular-nums'>
                  {stats.totalCarbonSavedKgCo2e.toLocaleString('id-ID')} kg CO2e
                </CardTitle>
              </CardHeader>
              <CardContent className='text-xs text-muted-foreground'>
                Berdasarkan transaksi selesai
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Petani aktif</CardDescription>
                <CardTitle className='font-mono text-2xl tabular-nums'>
                  {stats.activeFarmersCount.toLocaleString('id-ID')}
                </CardTitle>
              </CardHeader>
              <CardContent className='text-xs text-muted-foreground'>
                {stats.activeBuyersCount.toLocaleString('id-ID')} pembeli terdaftar
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Transaksi selesai</CardDescription>
                <CardTitle className='font-mono text-2xl tabular-nums'>
                  {stats.totalCompletedTransactions.toLocaleString('id-ID')}
                </CardTitle>
              </CardHeader>
              <CardContent className='text-xs text-muted-foreground'>
                Pengambilan mandiri terverifikasi
              </CardContent>
            </Card>
          </div>
        )
      )}

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {ADMIN_MODULES.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.href}>
              <CardHeader>
                <div className='flex items-center gap-2'>
                  <Icon className='size-5 text-primary' aria-hidden='true' />
                  <CardTitle>{item.title}</CardTitle>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant='outline' nativeButton={false} render={<Link href={item.href} />}>
                  {item.actionLabel}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
