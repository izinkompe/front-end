'use client'

import * as React from 'react'
import { Info, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { offersCollection } from '@/lib/api/db'
import { cn } from '@/lib/utils'
import type { CommodityCondition, Offer, OfferStatus } from '@/types/api/offers'

function Table({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<'table'> & { containerClassName?: string }) {
  return (
    <div
      data-slot='table-container'
      tabIndex={0}
      role='region'
      aria-label='Tabel data'
      className={cn('relative w-full overflow-x-auto', containerClassName)}
    >
      <table
        data-slot='table'
        className={cn('w-full caption-bottom text-xs', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot='table-header'
      className={cn('sticky top-0 z-10 bg-background [&_tr]:border-b', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot='table-body'
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot='table-footer'
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot='table-row'
      className={cn(
        'border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot='table-head'
      className={cn(
        'h-10 px-3 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot='table-cell'
      className={cn('p-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot='table-caption'
      className={cn('mt-4 text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

interface TableActionButtonsProps<T = Offer> {
  item: T
  onDelete?: (item: T) => void
  onInfo?: (item: T) => void
  onEdit?: (item: T) => void
  disabled?: boolean
  className?: string
}

function TableActionButtons<T = Offer>({
  item,
  onDelete,
  onInfo,
  onEdit,
  disabled,
  className,
}: TableActionButtonsProps<T>) {
  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        disabled={disabled}
        onClick={() => onDelete?.(item)}
        className='text-destructive hover:bg-destructive/10 hover:text-destructive'
        aria-label='Hapus'
        title='Hapus'
      >
        <Trash2 />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        disabled={disabled}
        onClick={() => onInfo?.(item)}
        aria-label='Info'
        title='Info'
      >
        <Info />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        disabled={disabled}
        onClick={() => onEdit?.(item)}
        aria-label='Edit'
        title='Edit'
      >
        <Pencil />
      </Button>
    </div>
  )
}

function formatCondition(condition: CommodityCondition): string {
  switch (condition) {
    case 'grade_b':
      return 'Grade B'
    case 'surplus':
      return 'Surplus'
    case 'imperfect_shape':
      return 'Bentuk Unik'
    case 'ripe_urgent':
      return 'Matang Segera'
    default:
      return condition
  }
}

function formatStatus(status: OfferStatus): string {
  switch (status) {
    case 'active':
      return 'Aktif'
    case 'sold_out':
      return 'Habis'
    case 'draft':
      return 'Draf'
    case 'closed':
      return 'Ditutup'
    case 'expired':
      return 'Kedaluwarsa'
    default:
      return status
  }
}

function formatCurrency(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

interface TanstackDbTableProps {
  data?: Offer[]
  className?: string
  containerClassName?: string
  caption?: string
  emptyMessage?: string
  onDelete?: (item: Offer) => void
  onInfo?: (item: Offer) => void
  onEdit?: (item: Offer) => void
}

function subscribeOffers(callback: () => void) {
  const sub = offersCollection.subscribeChanges(() => {
    callback()
  })
  return () => {
    sub.unsubscribe()
  }
}

function getOffersSnapshot(): Offer[] {
  return offersCollection.toArray
}

const emptyOffers: Offer[] = []
function getEmptyOffers(): Offer[] {
  return emptyOffers
}

function TanstackDbTable({
  data,
  className,
  containerClassName,
  caption,
  emptyMessage = 'Tidak ada data komoditas',
  onDelete,
  onInfo,
  onEdit,
}: TanstackDbTableProps) {
  const collectionItems = React.useSyncExternalStore(
    subscribeOffers,
    getOffersSnapshot,
    getEmptyOffers
  )

  const items = data ?? collectionItems

  const handleDelete = React.useCallback(
    (item: Offer) => {
      if (onDelete) {
        onDelete(item)
        return
      }
      offersCollection.delete(item.id)
    },
    [onDelete]
  )

  return (
    <Table className={className} containerClassName={containerClassName}>
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Komoditas</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Kondisi</TableHead>
          <TableHead>Stok</TableHead>
          <TableHead>Harga</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className='text-right'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className='h-24 text-center text-muted-foreground'>
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className='font-mono font-medium'>{item.id}</TableCell>
              <TableCell className='font-semibold'>{item.commodityName}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{formatCondition(item.condition)}</TableCell>
              <TableCell>{item.availableStockKg} kg</TableCell>
              <TableCell>{formatCurrency(item.pricePerKg)} / kg</TableCell>
              <TableCell>{formatStatus(item.status)}</TableCell>
              <TableCell className='text-right'>
                <TableActionButtons
                  item={item}
                  onDelete={handleDelete}
                  onInfo={onInfo}
                  onEdit={onEdit}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableActionButtons,
  TanstackDbTable,
  formatCondition,
  formatStatus,
  formatCurrency,
}
export type { TableActionButtonsProps, TanstackDbTableProps }
