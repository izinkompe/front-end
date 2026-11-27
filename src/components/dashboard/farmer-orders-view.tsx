'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Eye } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFarmerOrders, useMarkOrderReady } from '@/hooks/api/use-farmer'
import { getJakartaDate } from '@/lib/data/needs-board-helpers'
import type { Order, OrderStatus } from '@/types/api/orders'
import { DashboardFilterSelect } from './dashboard-filter-select'
import { DashboardPageHeader } from './dashboard-page-header'
import { createFarmerColumnHelper, FarmerDataTable } from './farmer/farmer-data-table'
import { OrderDetailSheet } from './farmer/order-detail-sheet'

const columnHelper = createFarmerColumnHelper<Order>()

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Menunggu Pembayaran',
  payment_submitted: 'Bukti Terkirim',
  processing: 'Perlu Disiapkan',
  ready_for_pickup: 'Siap Diambil',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  disputed: 'Dalam Tinjauan',
}

function QuickReadyButton({ orderId }: { orderId: string }) {
  const markReady = useMarkOrderReady(orderId)

  return (
    <Button
      type='button'
      size='icon-sm'
      aria-label='Tandai siap diambil'
      title='Siap diambil'
      disabled={markReady.isPending}
      onClick={() => markReady.mutate()}
    >
      {markReady.isPending ? <Spinner /> : <CheckCircle2 aria-hidden='true' />}
    </Button>
  )
}

export function FarmerOrdersView() {
  const { data: orders = [], isLoading, isError } = useFarmerOrders()
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const today = getJakartaDate()
  const selectedOrder = useMemo(
    () => orders.find((item) => item.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  )

  const filteredOrders = useMemo(
    () =>
      statusFilter === 'all' ? orders : orders.filter((order) => order.status === statusFilter),
    [orders, statusFilter]
  )

  const dailyPickupOrders = useMemo(
    () =>
      orders
        .filter(
          (order) =>
            order.scheduleSlot.date === today &&
            (order.status === 'processing' || order.status === 'ready_for_pickup')
        )
        .sort((a, b) => a.scheduleSlot.startTime.localeCompare(b.scheduleSlot.startTime)),
    [orders, today]
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('commodityName', {
        id: 'commodityName',
        header: 'Komoditas & ID',
        meta: { label: 'Komoditas & ID' },
        cell: (info) => {
          const order = info.row.original
          return (
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='font-medium text-foreground'>{order.commodityName}</span>
              <span className='font-mono text-meta text-muted-foreground'>{order.id}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor('buyerContactName', {
        header: 'Pembeli',
        meta: { label: 'Pembeli' },
        cell: (info) => {
          const order = info.row.original
          return (
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='text-foreground'>{order.buyerContactName || '-'}</span>
              {order.buyerOrganization && (
                <span className='text-meta text-muted-foreground'>{order.buyerOrganization}</span>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor('quantityKg', {
        header: 'Berat (kg)',
        meta: { label: 'Berat (kg)', nowrap: true, align: 'end' },
        cell: (info) => {
          const order = info.row.original
          return (
            <div className='flex flex-col items-end gap-0.5 font-mono tabular-nums'>
              <span className='font-medium text-foreground'>
                {order.quantityKg.toLocaleString('id-ID')} kg
              </span>
              {order.confirmedWeightKg !== undefined && (
                <span className='text-meta text-muted-foreground'>
                  Aktual {order.confirmedWeightKg.toLocaleString('id-ID')} kg
                </span>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor('totalPrice', {
        header: 'Total nilai',
        meta: { label: 'Total nilai', nowrap: true, align: 'end' },
        cell: (info) => (
          <span className='font-mono font-medium tabular-nums'>
            Rp {info.getValue().toLocaleString('id-ID')}
          </span>
        ),
      }),
      columnHelper.accessor((row) => `${row.scheduleSlot.date} ${row.scheduleSlot.startTime}`, {
        id: 'schedule',
        header: 'Jadwal ambil',
        meta: { label: 'Jadwal ambil' },
        cell: (info) => {
          const order = info.row.original
          return (
            <div className='flex flex-col gap-0.5'>
              <span className='text-foreground tabular-nums'>
                {order.scheduleSlot.date} ({order.scheduleSlot.startTime}–
                {order.scheduleSlot.endTime})
              </span>
              {order.proposedScheduleSlot && order.scheduleProposalStatus === 'pending' && (
                <span className='text-meta text-muted-foreground'>
                  Usulan: {order.proposedScheduleSlot.date} ({order.proposedScheduleSlot.startTime})
                </span>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        meta: { label: 'Status' },
        cell: (info) => {
          const order = info.row.original
          return (
            <div className='flex flex-col gap-1'>
              <Badge variant={order.status === 'processing' ? 'default' : 'secondary'}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              {order.status === 'cancelled' && !order.restockDecision && (
                <span className='text-meta text-muted-foreground'>Perlu konfirmasi stok</span>
              )}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        meta: { label: 'Aksi' },
        cell: (info) => {
          const order = info.row.original
          return (
            <div className='flex items-center gap-1.5'>
              {order.status === 'processing' && <QuickReadyButton orderId={order.id} />}
              <Button
                type='button'
                variant='outline'
                size='icon-sm'
                aria-label={`Detail pesanan ${order.commodityName}`}
                title='Detail'
                onClick={() => setSelectedOrderId(order.id)}
              >
                <Eye aria-hidden='true' />
              </Button>
            </div>
          )
        },
      }),
    ],
    []
  )

  const dailyColumns = useMemo(
    () => [
      columnHelper.accessor((row) => `${row.scheduleSlot.startTime}-${row.scheduleSlot.endTime}`, {
        id: 'slotTime',
        header: 'Slot jam',
        meta: { label: 'Slot jam', nowrap: true },
        cell: (info) => (
          <span className='font-mono font-semibold tabular-nums'>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('commodityName', {
        header: 'Komoditas & Berat',
        meta: { label: 'Komoditas & Berat' },
        cell: (info) => {
          const order = info.row.original
          return (
            <div className='flex flex-col gap-0.5'>
              <span className='font-medium text-foreground'>{order.commodityName}</span>
              <span className='font-mono text-meta text-muted-foreground tabular-nums'>
                {order.quantityKg.toLocaleString('id-ID')} kg
              </span>
            </div>
          )
        },
      }),
      columnHelper.accessor('buyerContactName', {
        header: 'Pembeli & Kontak',
        meta: { label: 'Pembeli & Kontak' },
        cell: (info) => {
          const order = info.row.original
          return (
            <div className='flex flex-col gap-0.5'>
              <span className='text-foreground'>{order.buyerContactName || '-'}</span>
              <span className='font-mono text-meta text-muted-foreground'>
                {order.buyerContactPhone || '-'}
              </span>
            </div>
          )
        },
      }),
      columnHelper.accessor((row) => row.pickupLocation.address, {
        id: 'pickupAddress',
        header: 'Lokasi kebun',
        meta: { label: 'Lokasi kebun' },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        meta: { label: 'Status', nowrap: true },
        cell: (info) => (
          <Badge variant={info.getValue() === 'processing' ? 'default' : 'secondary'}>
            {ORDER_STATUS_LABELS[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'dailyActions',
        header: 'Aksi',
        meta: { label: 'Aksi' },
        cell: (info) => {
          const order = info.row.original
          return (
            <div className='flex items-center gap-1.5'>
              {order.status === 'processing' && <QuickReadyButton orderId={order.id} />}
              <Button
                type='button'
                variant='outline'
                size='icon-sm'
                aria-label={`Detail pesanan ${order.commodityName}`}
                title='Detail'
                onClick={() => setSelectedOrderId(order.id)}
              >
                <Eye aria-hidden='true' />
              </Button>
            </div>
          )
        },
      }),
    ],
    []
  )

  return (
    <div className='flex flex-col gap-6'>
      <DashboardPageHeader title='Pesanan Masuk' />

      {isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>Gagal memuat daftar pesanan masuk.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Skeleton className='h-80 w-full' />
      ) : (
        <Tabs defaultValue='all' className='flex flex-col gap-4'>
          <TabsList className='scroll-strip max-w-full justify-start'>
            <TabsTrigger value='all'>Semua pesanan ({orders.length})</TabsTrigger>
            <TabsTrigger value='today'>
              Siap serah hari ini ({dailyPickupOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value='all'>
            <FarmerDataTable
              data={filteredOrders}
              columns={columns}
              caption='Daftar pesanan masuk milik petani'
              rowHeaderColumnId='commodityName'
              searchPlaceholder='Cari komoditas, ID pesanan, atau pembeli...'
              searchAriaLabel='Cari pesanan masuk'
              filterSlot={
                <DashboardFilterSelect
                  ariaLabel='Filter status pesanan'
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'Semua status' },
                    { value: 'processing', label: 'Perlu Disiapkan' },
                    { value: 'ready_for_pickup', label: 'Siap Diambil' },
                    { value: 'disputed', label: 'Sengketa' },
                    { value: 'cancelled', label: 'Dibatalkan' },
                    { value: 'completed', label: 'Selesai' },
                  ]}
                />
              }
              emptyTitle='Belum ada pesanan pada filter ini'
              emptyDescription='Pesanan pembeli yang masuk ke penawaran Anda akan tampil di sini.'
            />
          </TabsContent>

          <TabsContent value='today'>
            <FarmerDataTable
              data={dailyPickupOrders}
              columns={dailyColumns}
              caption={`Daftar siap serah pengambilan mandiri tanggal ${today}`}
              rowHeaderColumnId='slotTime'
              searchPlaceholder='Cari jadwal serah hari ini...'
              searchAriaLabel='Cari jadwal serah hari ini'
              emptyTitle='Tidak ada pengambilan terjadwal hari ini'
              emptyDescription='Pesanan aktif dengan slot pengambilan hari ini akan dikelompokkan di sini.'
            />
          </TabsContent>
        </Tabs>
      )}

      <OrderDetailSheet
        order={selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null)
        }}
      />
    </div>
  )
}
