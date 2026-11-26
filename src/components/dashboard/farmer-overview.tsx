'use client'

import Link from 'next/link'
import { Package, ShoppingBasket, Sprout, Store } from 'lucide-react'
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
import type { User } from '@/types/api/auth'

interface FarmerOverviewProps {
  user?: User | null
}

const FARMER_MODULES = [
  {
    title: 'Toko Saya',
    description: 'Atur nama toko publik, deskripsi panen, dan catatan untuk pembeli.',
    href: '/dashboard/toko',
    actionLabel: 'Kelola toko',
    icon: Store,
  },
  {
    title: 'Kebun Saya',
    description: 'Catat lokasi lahan, koordinat pengambilan, dan catatan akses kendaraan.',
    href: '/dashboard/kebun',
    actionLabel: 'Kelola kebun',
    icon: Sprout,
  },
  {
    title: 'Penawaran Panen',
    description: 'Publikasikan hasil panen surplus lengkap dengan stok dan jadwal tutup.',
    href: '/dashboard/penawaran',
    actionLabel: 'Lihat penawaran',
    icon: Package,
  },
  {
    title: 'Pesanan Masuk',
    description: 'Pantau reservasi pembeli dan tandai pesanan yang siap diambil.',
    href: '/dashboard/pesanan',
    actionLabel: 'Lihat pesanan',
    icon: ShoppingBasket,
  },
] as const

export function FarmerOverview({ user }: FarmerOverviewProps) {
  const { data: store, isLoading: storeLoading } = useFarmerStoreSettings()
  const { data: farms = [], isLoading: farmsLoading } = useFarmerFarms()
  const { data: offers = [], isLoading: offersLoading } = useFarmerOffers()
  const { data: orders = [], isLoading: ordersLoading } = useFarmerOrders()

  const displayName = user?.name ?? 'Mitra Petani'
  const organization = store?.storeName ?? user?.organization ?? 'Kelompok Tani Mitra'
  const isVerified = user?.isVerifiedFarmer ?? false

  const activeFarmsCount = farms.filter((farm) => farm.status === 'active').length
  const activeOffers = offers.filter((offer) => offer.status === 'active')
  const totalAvailableStock = activeOffers.reduce((sum, offer) => sum + offer.availableStockKg, 0)
  const pendingPickupOrders = orders.filter((order) => order.status === 'processing').length
  const metricsLoading = storeLoading || farmsLoading || offersLoading || ordersLoading

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl font-semibold text-foreground'>
            Selamat datang, {displayName}
          </h1>
          <p className='text-base text-muted-foreground'>{organization}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant={isVerified ? 'default' : 'secondary'}>
            {isVerified ? 'Petani Terverifikasi' : 'Menunggu Verifikasi'}
          </Badge>
          <Button nativeButton={false} render={<Link href='/dashboard/penawaran' />}>
            Lihat penawaran
          </Button>
        </div>
      </div>

      {metricsLoading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Kebun aktif</CardDescription>
              <CardTitle className='font-mono text-2xl tabular-nums'>{activeFarmsCount}</CardTitle>
            </CardHeader>
            <CardContent className='text-xs text-muted-foreground'>
              Dari total {farms.length} kebun terdaftar
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Penawaran aktif</CardDescription>
              <CardTitle className='font-mono text-2xl tabular-nums'>
                {activeOffers.length}
              </CardTitle>
            </CardHeader>
            <CardContent className='text-xs text-muted-foreground'>
              Stok tersedia {totalAvailableStock.toLocaleString('id-ID')} kg
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Perlu disiapkan</CardDescription>
              <CardTitle className='font-mono text-2xl tabular-nums'>
                {pendingPickupOrders}
              </CardTitle>
            </CardHeader>
            <CardContent className='text-xs text-muted-foreground'>
              Dari total {orders.length} pesanan masuk
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Komoditas utama</CardDescription>
              <CardTitle className='font-mono text-2xl tabular-nums'>
                {store?.primaryCommodities.length ?? 0}
              </CardTitle>
            </CardHeader>
            <CardContent className='truncate text-xs text-muted-foreground'>
              {store?.storeName ?? organization}
            </CardContent>
          </Card>
        </div>
      )}

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {FARMER_MODULES.map((item) => {
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
