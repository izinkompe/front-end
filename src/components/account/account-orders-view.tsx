'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarClock, MapPin, PackageOpen, Search, Sprout } from 'lucide-react'
import {
  formatNextPickupSlot,
  formatPlainRupiah,
  formatWeightKg,
} from '@/components/home/offer-card-helpers'
import { isSafeOfferPhotoUrl } from '@/lib/data/offer-detail-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useOrders } from '@/hooks/api/use-orders'
import { formatOrderStatusLabel } from '@/lib/data/checkout-helpers'
import {
  filterAccountOrders,
  formatShortDateId,
  type AccountOrdersTab,
} from '@/lib/data/profile-helpers'
import type { Order, OrderStatus } from '@/types/api/orders'

const ACTIVE_STATUS_OPTIONS: ReadonlyArray<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Semua status' },
  { value: 'pending_payment', label: 'Menunggu pembayaran' },
  { value: 'payment_submitted', label: 'Menunggu verifikasi' },
  { value: 'processing', label: 'Pembayaran disetujui' },
  { value: 'ready_for_pickup', label: 'Siap diambil' },
]

const HISTORY_STATUS_OPTIONS: ReadonlyArray<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Semua status' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

function getOrderBadgeVariant(status: OrderStatus, rejectionReason?: string) {
  if (status === 'cancelled' || (status === 'pending_payment' && Boolean(rejectionReason))) {
    return 'destructive' as const
  }
  if (status === 'processing' || status === 'ready_for_pickup' || status === 'completed') {
    return 'default' as const
  }
  return 'secondary' as const
}

function OrderListItem({ order }: { order: Order }) {
  const photoUrl = order.commodityPhotoUrl ? isSafeOfferPhotoUrl(order.commodityPhotoUrl) : null
  const statusLabel = formatOrderStatusLabel(order.status, order.rejectionReason)
  const badgeVariant = getOrderBadgeVariant(order.status, order.rejectionReason)

  return (
    <div className='flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80 sm:flex-row sm:items-start sm:justify-between'>
      <div className='flex min-w-0 flex-1 gap-3.5'>
        <div className='relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted'>
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={order.commodityName}
              fill
              sizes='64px'
              className='object-cover'
            />
          ) : (
            <Sprout className='size-6 text-muted-foreground' aria-hidden='true' />
          )}
        </div>

        <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant={badgeVariant}>{statusLabel}</Badge>
            <span className='text-xs text-muted-foreground tabular-nums'>
              {order.id} · {formatShortDateId(order.createdAt)}
            </span>
          </div>

          <Link
            href={`/pesanan/${order.id}`}
            className='truncate text-base font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            {order.commodityName}
          </Link>

          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground'>
            <span className='tabular-nums'>
              {formatWeightKg(order.quantityKg)} ({formatPlainRupiah(order.totalPrice)})
            </span>
            <span className='flex items-center gap-1'>
              <CalendarClock className='size-3.5 shrink-0' aria-hidden='true' />
              <span className='tabular-nums'>{formatNextPickupSlot([order.scheduleSlot])}</span>
            </span>
            <span className='flex items-center gap-1 truncate'>
              <MapPin className='size-3.5 shrink-0' aria-hidden='true' />
              <span className='truncate'>{order.pickupLocation.address}</span>
            </span>
          </div>
        </div>
      </div>

      <div className='flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end'>
        {order.status === 'pending_payment' && (
          <Button
            size='sm'
            nativeButton={false}
            render={<Link href={`/pesanan/${order.id}/bayar`} />}
          >
            Lanjut bayar
          </Button>
        )}
        <Button
          variant='outline'
          size='sm'
          nativeButton={false}
          render={<Link href={`/pesanan/${order.id}`} />}
        >
          Lihat detail
        </Button>
      </div>
    </div>
  )
}

export function AccountOrdersView() {
  const { data: currentUser } = useCurrentUser()
  const { data: orders = [], isPending, isError, refetch } = useOrders()
  const [activeTab, setActiveTab] = useState<AccountOrdersTab>('aktif')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  const baseTabOrders = filterAccountOrders(orders, {
    tab: activeTab,
    userId: currentUser?.id,
  })
  const filteredOrders = filterAccountOrders(orders, {
    tab: activeTab,
    query,
    statusFilter,
    userId: currentUser?.id,
  })

  const statusOptions = activeTab === 'aktif' ? ACTIVE_STATUS_OPTIONS : HISTORY_STATUS_OPTIONS

  function handleTabChange(nextValue: string) {
    setActiveTab(nextValue as AccountOrdersTab)
    setStatusFilter('all')
    setQuery('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesanan Saya</CardTitle>
      </CardHeader>

      <CardContent className='flex flex-col gap-5'>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList variant='line' className='w-full justify-start border-b border-border'>
            <TabsTrigger value='aktif' className='flex-none px-4'>
              Aktif
            </TabsTrigger>
            <TabsTrigger value='riwayat' className='flex-none px-4'>
              Riwayat
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className='flex flex-col gap-4 pt-4'>
            {isPending ? (
              <div className='flex flex-col gap-3'>
                <Skeleton className='h-28 w-full rounded-xl' />
                <Skeleton className='h-28 w-full rounded-xl' />
              </div>
            ) : isError ? (
              <Alert variant='destructive'>
                <AlertDescription className='flex flex-wrap items-center justify-between gap-2'>
                  <span>Daftar pesanan gagal dimuat.</span>
                  <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
                    Coba lagi
                  </Button>
                </AlertDescription>
              </Alert>
            ) : baseTabOrders.length === 0 ? (
              <Empty className='border border-dashed'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <PackageOpen aria-hidden='true' />
                  </EmptyMedia>
                  <EmptyTitle>
                    {activeTab === 'aktif'
                      ? 'Belum ada pesanan aktif'
                      : 'Belum ada riwayat pesanan'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {activeTab === 'aktif'
                      ? 'Pesanan yang menunggu pembayaran atau siap diambil akan muncul di sini.'
                      : 'Pesanan yang telah selesai atau dibatalkan akan tercatat di sini.'}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button nativeButton={false} render={<Link href='/pasar' />}>
                    Cari hasil panen
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                  <InputGroup className='flex-1'>
                    <InputGroupAddon align='inline-start'>
                      <Search aria-hidden='true' />
                    </InputGroupAddon>
                    <InputGroupInput
                      type='search'
                      aria-label='Cari pesanan berdasarkan komoditas atau nomor pesanan'
                      placeholder='Cari komoditas atau no. pesanan'
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </InputGroup>

                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter((value as OrderStatus | 'all') ?? 'all')
                    }
                  >
                    <SelectTrigger className='w-full sm:w-56' aria-label='Filter status pesanan'>
                      <SelectValue placeholder='Semua status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {filteredOrders.length === 0 ? (
                  <Empty className='border border-dashed'>
                    <EmptyHeader>
                      <EmptyTitle>Pesanan tidak ditemukan</EmptyTitle>
                      <EmptyDescription>
                        Ubah kata kunci pencarian atau pilih status pesanan lainnya.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setQuery('')
                          setStatusFilter('all')
                        }}
                      >
                        Reset filter
                      </Button>
                    </EmptyContent>
                  </Empty>
                ) : (
                  <div className='flex flex-col gap-3'>
                    {filteredOrders.map((order) => (
                      <OrderListItem key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
