'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar as CalendarIcon, ReceiptText, RotateCcw, Search } from 'lucide-react'
import { formatPlainRupiah, formatWeightKg } from '@/components/home/offer-card-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Field, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useOrders } from '@/hooks/api/use-orders'
import { formatOrderStatusLabel } from '@/lib/data/checkout-helpers'
import { filterAccountTransactions, formatShortDateId } from '@/lib/data/profile-helpers'
import { AccountTransactionSummary } from './account-transaction-summary'
import type { OrderStatus } from '@/types/api/orders'

function getTransactionBadgeVariant(status: OrderStatus) {
  if (status === 'cancelled') return 'destructive' as const
  if (status === 'processing' || status === 'ready_for_pickup' || status === 'completed') {
    return 'default' as const
  }
  return 'secondary' as const
}

export function AccountTransactionsView() {
  const { data: currentUser } = useCurrentUser()
  const { data: orders = [], isPending, isError, refetch } = useOrders()
  const [query, setQuery] = useState('')
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)

  const filteredTransactions = filterAccountTransactions(orders, {
    query,
    fromDate,
    toDate,
    userId: currentUser?.id,
  })

  const hasFilters = Boolean(query.trim() || fromDate || toDate)

  function resetFilters() {
    setQuery('')
    setFromDate(null)
    setToDate(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Transaksi</CardTitle>
      </CardHeader>

      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-col gap-3'>
          <InputGroup>
            <InputGroupAddon align='inline-start'>
              <Search aria-hidden='true' />
            </InputGroupAddon>
            <InputGroupInput
              type='search'
              aria-label='Cari nama komoditas atau nomor pesanan'
              placeholder='Cari nama komoditas, petani, atau no. pesanan'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <Field>
              <FieldLabel>Dari tanggal</FieldLabel>
              <Popover open={fromOpen} onOpenChange={setFromOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      type='button'
                      variant='outline'
                      className='w-full justify-between font-normal'
                    />
                  }
                >
                  <span className='tabular-nums'>
                    {fromDate ? formatShortDateId(fromDate) : 'Pilih tanggal mulai'}
                  </span>
                  <CalendarIcon data-icon='inline-end' aria-hidden='true' />
                </PopoverTrigger>
                <PopoverContent align='start' className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={fromDate ?? undefined}
                    onSelect={(date) => {
                      setFromDate(date ?? null)
                      setFromOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <FieldLabel>Sampai tanggal</FieldLabel>
              <Popover open={toOpen} onOpenChange={setToOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      type='button'
                      variant='outline'
                      className='w-full justify-between font-normal'
                    />
                  }
                >
                  <span className='tabular-nums'>
                    {toDate ? formatShortDateId(toDate) : 'Pilih tanggal akhir'}
                  </span>
                  <CalendarIcon data-icon='inline-end' aria-hidden='true' />
                </PopoverTrigger>
                <PopoverContent align='start' className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={toDate ?? undefined}
                    onSelect={(date) => {
                      setToDate(date ?? null)
                      setToOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </div>

          {hasFilters && (
            <div className='flex justify-end'>
              <Button type='button' variant='ghost' size='sm' onClick={resetFilters}>
                <RotateCcw data-icon='inline-start' aria-hidden='true' />
                <span>Reset filter</span>
              </Button>
            </div>
          )}
        </div>

        {!isPending && !isError && (
          <AccountTransactionSummary
            orders={filteredTransactions}
            fromDate={fromDate}
            toDate={toDate}
          />
        )}

        {isPending ? (
          <div className='flex flex-col gap-3'>
            <Skeleton className='h-24 w-full rounded-xl' />
            <Skeleton className='h-24 w-full rounded-xl' />
          </div>
        ) : isError ? (
          <Alert variant='destructive'>
            <AlertDescription className='flex flex-wrap items-center justify-between gap-2'>
              <span>Riwayat transaksi gagal dimuat.</span>
              <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
                Coba lagi
              </Button>
            </AlertDescription>
          </Alert>
        ) : filteredTransactions.length === 0 ? (
          <Empty className='border border-dashed'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <ReceiptText aria-hidden='true' />
              </EmptyMedia>
              <EmptyTitle>
                {hasFilters ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}
              </EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? 'Atur ulang rentang tanggal atau kata kunci untuk melihat transaksi lain.'
                  : 'Catatan pembayaran pesanan panen Anda akan muncul di sini.'}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {hasFilters ? (
                <Button type='button' variant='outline' size='sm' onClick={resetFilters}>
                  Reset filter
                </Button>
              ) : (
                <Button nativeButton={false} render={<Link href='/pasar' />}>
                  Cari hasil panen
                </Button>
              )}
            </EmptyContent>
          </Empty>
        ) : (
          <div className='flex flex-col gap-3'>
            {filteredTransactions.map((order) => (
              <div
                key={order.id}
                className='flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between'
              >
                <div className='flex min-w-0 flex-1 flex-col gap-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge variant={getTransactionBadgeVariant(order.status)}>
                      {formatOrderStatusLabel(order.status, order.rejectionReason)}
                    </Badge>
                    <span className='text-xs text-muted-foreground tabular-nums'>
                      {order.id} · {formatShortDateId(order.createdAt)}
                    </span>
                  </div>
                  <p className='truncate font-semibold text-foreground'>{order.commodityName}</p>
                  <p className='text-sm text-muted-foreground tabular-nums'>
                    {formatWeightKg(order.quantityKg)} · {order.farmerName ?? 'Petani Mitra'}
                  </p>
                </div>

                <div className='flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end'>
                  <p className='text-base font-semibold text-foreground tabular-nums'>
                    {formatPlainRupiah(order.totalPrice)}
                  </p>
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
