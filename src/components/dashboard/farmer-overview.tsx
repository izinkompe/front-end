'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
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
import { useFarmerOrders } from '@/hooks/api/use-farmer'
import {
  useFarmerFarms,
  useFarmerOffers,
  useFarmerStoreSettings,
} from '@/hooks/api/use-farmer-management'
import { useNeedsBoard } from '@/hooks/api/use-needs-board'
import { isActiveNeed } from '@/lib/data/needs-board-helpers'
import type { User } from '@/types/api/auth'
import { DashboardPageHeader } from './dashboard-page-header'
import { FarmerVerificationBanner } from './farmer/farmer-verification-banner'

interface FarmerOverviewProps {
  user?: User | null
}

const FARMER_MODULES = [
  {
    title: 'Toko Saya',
    href: '/dashboard/toko',
    actionLabel: 'Kelola toko',
  },
  {
    title: 'Kebun Saya',
    href: '/dashboard/kebun',
    actionLabel: 'Kelola kebun',
  },
  {
    title: 'Penawaran Panen',
    href: '/dashboard/penawaran',
    actionLabel: 'Lihat penawaran',
  },
  {
    title: 'Pesanan Masuk',
    href: '/dashboard/pesanan',
    actionLabel: 'Lihat pesanan',
  },
  {
    title: 'Papan Kebutuhan',
    href: '/dashboard/papan-kebutuhan',
    actionLabel: 'Lihat permintaan',
  },
] as const

export function FarmerOverview({ user }: FarmerOverviewProps) {
  const { data: store, isLoading: storeLoading } = useFarmerStoreSettings()
  const { data: farms = [], isLoading: farmsLoading } = useFarmerFarms()
  const { data: offers = [], isLoading: offersLoading } = useFarmerOffers()
  const { data: orders = [], isLoading: ordersLoading } = useFarmerOrders()
  const { data: needs = [], isLoading: needsLoading } = useNeedsBoard()

  const displayName = user?.name ?? 'Mitra Petani'
  const organization = store?.storeName ?? user?.organization ?? 'Kelompok Tani Mitra'
  const isVerified = user?.isVerifiedFarmer ?? false

  const activeFarmsCount = farms.filter((farm) => farm.status === 'active').length
  const activeOffers = offers.filter((offer) => offer.status === 'active')
  const totalAvailableStock = activeOffers.reduce((sum, offer) => sum + offer.availableStockKg, 0)
  const pendingPickupOrders = orders.filter((order) => order.status === 'processing').length
  const activeNeedsCount = needs.filter(isActiveNeed).length
  const metricsLoading =
    storeLoading || farmsLoading || offersLoading || ordersLoading || needsLoading

  return (
    <div className='flex flex-col gap-6'>
      <DashboardPageHeader
        title={`Selamat datang, ${displayName}`}
        subtitle={organization}
        badge={
          <Badge variant={isVerified ? 'default' : 'secondary'}>
            {isVerified ? 'Petani Terverifikasi' : 'Menunggu Verifikasi'}
          </Badge>
        }
        actions={
          <Button nativeButton={false} render={<Link href='/dashboard/penawaran/baru' />}>
            Buat penawaran
          </Button>
        }
      />

      <FarmerVerificationBanner isVerified={isVerified} context='overview' />

      {metricsLoading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='min-w-0'>
            <CardHeader className='pb-2'>
              <CardDescription>Kebun aktif</CardDescription>
              <CardTitle className='type-kpi font-mono tabular-nums'>{activeFarmsCount}</CardTitle>
            </CardHeader>
            <CardContent className='text-meta text-muted-foreground'>
              Dari total {farms.length} kebun terdaftar
            </CardContent>
          </Card>
          <Card className='min-w-0'>
            <CardHeader className='pb-2'>
              <CardDescription>Penawaran aktif</CardDescription>
              <CardTitle className='type-kpi font-mono tabular-nums'>
                {activeOffers.length}
              </CardTitle>
            </CardHeader>
            <CardContent className='text-meta text-muted-foreground'>
              Stok tersedia {totalAvailableStock.toLocaleString('id-ID')} kg
            </CardContent>
          </Card>
          <Card className='min-w-0'>
            <CardHeader className='pb-2'>
              <CardDescription>Perlu disiapkan</CardDescription>
              <CardTitle className='type-kpi font-mono tabular-nums'>
                {pendingPickupOrders}
              </CardTitle>
            </CardHeader>
            <CardContent className='text-meta text-muted-foreground'>
              Dari total {orders.length} pesanan masuk
            </CardContent>
          </Card>
          <Card className='min-w-0'>
            <CardHeader className='pb-2'>
              <CardDescription>Papan Kebutuhan aktif</CardDescription>
              <CardTitle className='type-kpi font-mono tabular-nums'>{activeNeedsCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {FARMER_MODULES.map((item) => (
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
