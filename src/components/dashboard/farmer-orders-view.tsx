'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useFarmerOrders, useMarkOrderReady } from '@/hooks/api/use-farmer'
import type { Order, OrderStatus } from '@/types/api/orders'

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Menunggu Pembayaran',
  payment_submitted: 'Bukti Terkirim',
  processing: 'Perlu Disiapkan',
  ready_for_pickup: 'Siap Diambil',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  disputed: 'Dalam Tinjauan',
}

function FarmerOrderCard({ order }: { order: Order }) {
  const markReady = useMarkOrderReady(order.id)

  return (
    <Card className='min-w-0'>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex min-w-0 flex-col gap-1'>
            <CardTitle>{order.commodityName}</CardTitle>
            <CardDescription className='truncate font-mono text-meta'>{order.id}</CardDescription>
          </div>
          <Badge variant={order.status === 'processing' ? 'default' : 'secondary'}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4'>
        <div className='min-w-0'>
          <p className='text-muted-foreground'>Pembeli</p>
          <p className='truncate font-medium text-foreground'>{order.buyerContactName}</p>
        </div>
        <div className='min-w-0'>
          <p className='text-muted-foreground'>Berat pesanan</p>
          <p className='font-mono font-medium text-foreground'>
            {order.quantityKg.toLocaleString('id-ID')} kg
          </p>
        </div>
        <div className='min-w-0'>
          <p className='text-muted-foreground'>Total nilai</p>
          <p className='font-mono font-medium text-foreground'>
            Rp {order.totalPrice.toLocaleString('id-ID')}
          </p>
        </div>
        <div className='min-w-0'>
          <p className='text-muted-foreground'>Jadwal ambil</p>
          <p className='text-foreground'>
            {order.scheduleSlot.date} ({order.scheduleSlot.startTime} - {order.scheduleSlot.endTime}
            )
          </p>
        </div>
      </CardContent>
      {order.status === 'processing' && (
        <CardFooter className='flex items-center justify-between gap-2'>
          {markReady.isError && (
            <span className='text-sm text-destructive'>{markReady.error.message}</span>
          )}
          <Button
            disabled={markReady.isPending}
            onClick={() => markReady.mutate()}
            className='ml-auto'
          >
            {markReady.isPending ? (
              <Spinner data-icon='inline-start' />
            ) : (
              <CheckCircle2 data-icon='inline-start' />
            )}
            <span>Tandai siap diambil</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export function FarmerOrdersView() {
  const { data: orders = [], isLoading, isError } = useFarmerOrders()

  return (
    <div className='flex flex-col gap-6'>
      <h1 className='type-h1 font-semibold text-foreground'>Pesanan Masuk</h1>

      {isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>Gagal memuat daftar pesanan masuk.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className='flex flex-col gap-4'>
          <Skeleton className='h-36 w-full' />
          <Skeleton className='h-36 w-full' />
        </div>
      ) : orders.length === 0 ? (
        <Empty className='border border-border bg-card'>
          <EmptyHeader>
            <EmptyTitle>Belum ada pesanan masuk</EmptyTitle>
            <EmptyDescription>
              Pesanan dari pembeli untuk penawaran panen Anda akan muncul di sini.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='flex flex-col gap-4'>
          {orders.map((order) => (
            <FarmerOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
