'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ReceiptText, RotateCcw, Search } from 'lucide-react'
import { formatPlainRupiah, formatWeightKg } from '@/components/home/offer-card-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
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

function TransactionsListSkeleton() {
  return (
    <div className='flex flex-col gap-5' aria-busy='true' aria-label='Memuat riwayat transaksi'>
      <div className='flex flex-col gap-3'>
        <Skeleton className='h-10 w-full rounded-lg' />
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full rounded-lg' />
          </div>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-10 w-full rounded-lg' />
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:p-6'>
        <div className='flex flex-col gap-1.5'>
          <Skeleton className='h-5 w-44' />
          <Skeleton className='h-4 w-72 max-w-full' />
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className='flex flex-col gap-1.5 rounded-lg border border-border bg-background p-3'
            >
              <Skeleton className='h-3.5 w-24' />
              <Skeleton className='h-6 w-28' />
            </div>
          ))}
        </div>
      </div>

      <div className='flex flex-col gap-3'>
        {[0, 1].map((item) => (
          <div
            key={item}
            className='flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between'
          >
            <div className='flex min-w-0 flex-1 flex-col gap-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <Skeleton className='h-5 w-28 rounded-full' />
                <Skeleton className='h-4 w-32' />
              </div>
              <Skeleton className='h-5 w-44 max-w-full' />
              <Skeleton className='h-4 w-36' />
            </div>
            <div className='flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end'>
              <Skeleton className='h-5 w-24' />
              <Skeleton className='h-9 w-24 rounded-lg' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AccountTransactionsView() {
  const { data: currentUser } = useCurrentUser()
  const { data: orders = [], isPending, isError, refetch } = useOrders()
  const [query, setQuery] = useState('')
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)

  const baseTransactions = filterAccountTransactions(orders, {
    userId: currentUser?.id,
  })
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
        {isPending ? (
          <TransactionsListSkeleton />
        ) : isError ? (
          <Alert variant='destructive'>
            <AlertDescription className='flex flex-wrap items-center justify-between gap-2'>
              <span>Riwayat transaksi gagal dimuat.</span>
              <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
                Coba lagi
              </Button>
            </AlertDescription>
          </Alert>
        ) : baseTransactions.length === 0 ? (
          <Empty className='border border-dashed'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <ReceiptText aria-hidden='true' />
              </EmptyMedia>
              <EmptyTitle>Belum ada transaksi</EmptyTitle>
              <EmptyDescription>
                Catatan pembayaran pesanan panen Anda akan muncul di sini.
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
                  <FieldLabel htmlFor='transactions-from-date'>Dari tanggal</FieldLabel>
                  <DatePicker
                    id='transactions-from-date'
                    value={fromDate ?? undefined}
                    onValueChange={(date) => setFromDate(date ?? null)}
                    placeholder='Pilih tanggal mulai'
                    displayValue={fromDate ? formatShortDateId(fromDate) : undefined}
                    showClearAction
                    clearLabel='Hapus'
                    onClear={() => setFromDate(null)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor='transactions-to-date'>Sampai tanggal</FieldLabel>
                  <DatePicker
                    id='transactions-to-date'
                    value={toDate ?? undefined}
                    onValueChange={(date) => setToDate(date ?? null)}
                    placeholder='Pilih tanggal akhir'
                    displayValue={toDate ? formatShortDateId(toDate) : undefined}
                    showClearAction
                    clearLabel='Hapus'
                    onClear={() => setToDate(null)}
                  />
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

            <AccountTransactionSummary
              orders={filteredTransactions}
              fromDate={fromDate}
              toDate={toDate}
            />

            {filteredTransactions.length === 0 ? (
              <Empty className='border border-dashed'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <ReceiptText aria-hidden='true' />
                  </EmptyMedia>
                  <EmptyTitle>Transaksi tidak ditemukan</EmptyTitle>
                  <EmptyDescription>
                    Atur ulang rentang tanggal atau kata kunci untuk melihat transaksi lain.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button type='button' variant='outline' size='sm' onClick={resetFilters}>
                    Reset filter
                  </Button>
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
                      <p className='truncate font-semibold text-foreground'>
                        {order.commodityName}
                      </p>
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
