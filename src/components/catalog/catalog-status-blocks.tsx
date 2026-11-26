'use client'

import Link from 'next/link'
import { AlertCircle, ChevronRight, RefreshCw, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { MainCategoryMeta } from '@/lib/data/categories'
import type { ActiveFilterChip, CatalogFilterState } from '@/lib/data/catalog-filters'
import { CatalogCardsGridSkeleton } from './catalog-loading-skeleton'

interface CatalogBreadcrumbProps {
  categoryMeta: MainCategoryMeta | null
}

export function CatalogBreadcrumb({ categoryMeta }: CatalogBreadcrumbProps) {
  return (
    <nav aria-label='Breadcrumb'>
      <ol className='flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground'>
        <li>
          <Link
            href='/'
            className='rounded-sm py-1 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
          >
            Beranda
          </Link>
        </li>
        <li aria-hidden='true' className='flex items-center'>
          <ChevronRight className='size-4' />
        </li>
        <li>
          {categoryMeta ? (
            <Link
              href='/pasar'
              className='rounded-sm py-1 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
            >
              Pasar
            </Link>
          ) : (
            <span aria-current='page' className='font-medium text-foreground'>
              Pasar
            </span>
          )}
        </li>
        {categoryMeta && (
          <>
            <li aria-hidden='true' className='flex items-center'>
              <ChevronRight className='size-4' />
            </li>
            <li>
              <span aria-current='page' className='font-medium text-foreground'>
                {categoryMeta.label}
              </span>
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}

interface CatalogActiveFilterChipsProps {
  chips: ReadonlyArray<ActiveFilterChip>
  onClearChip: (updater: (prev: CatalogFilterState) => CatalogFilterState) => void
  onClearAll: () => void
}

export function CatalogActiveFilterChips({
  chips,
  onClearChip,
  onClearAll,
}: CatalogActiveFilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div aria-label='Filter yang sedang aktif' className='flex flex-wrap items-center gap-2'>
      {chips.map((chip) => (
        <Button
          key={chip.key}
          type='button'
          variant='secondary'
          size='sm'
          onClick={() => onClearChip(chip.clear)}
          aria-label={`Hapus filter ${chip.label}`}
          className='rounded-full'
        >
          <span>{chip.label}</span>
          <X data-icon='inline-end' aria-hidden='true' />
        </Button>
      ))}

      <Button type='button' variant='link' size='sm' onClick={onClearAll} className='px-2'>
        Hapus semua filter
      </Button>
    </div>
  )
}

interface CatalogStatusFallbackProps {
  isPending: boolean
  isError: boolean
  itemCount: number
  activeFilterCount: number
  onRefetch: () => void
  onClearAll: () => void
}

export function CatalogStatusFallback({
  isPending,
  isError,
  itemCount,
  activeFilterCount,
  onRefetch,
  onClearAll,
}: CatalogStatusFallbackProps) {
  if (isPending) {
    return <CatalogCardsGridSkeleton />
  }

  if (isError) {
    return (
      <Alert className='border-border bg-card text-card-foreground'>
        <AlertCircle aria-hidden='true' />
        <AlertTitle>Gagal memuat katalog panen</AlertTitle>
        <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <span>Periksa koneksi internet Anda lalu muat ulang halaman ini.</span>
          <Button type='button' variant='outline' size='sm' onClick={onRefetch} className='w-fit'>
            <RefreshCw data-icon='inline-start' aria-hidden='true' />
            Muat ulang
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (itemCount === 0) {
    return (
      <div className='flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:flex-row sm:items-center'>
        <div className='flex flex-col gap-1.5'>
          <h2 className='text-lg leading-snug font-semibold text-foreground'>
            Belum ada penawaran yang cocok dengan filter ini
          </h2>
          <p className='max-w-[60ch] text-base leading-relaxed text-muted-foreground'>
            Hapus beberapa filter untuk memperluas pencarian, atau pasang kebutuhan di Papan
            Kebutuhan Pangan agar petani dapat menanggapi.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2.5'>
          {activeFilterCount > 0 && (
            <Button type='button' variant='default' size='sm' onClick={onClearAll}>
              Hapus semua filter
            </Button>
          )}
          <Button
            variant='outline'
            size='sm'
            nativeButton={false}
            render={<Link href='/papan-kebutuhan' />}
          >
            Pasang kebutuhan pangan
          </Button>
        </div>
      </div>
    )
  }

  return null
}

interface CatalogLoadMoreFooterProps {
  visibleCount: number
  totalCount: number
  onLoadMore: () => void
}

export function CatalogLoadMoreFooter({
  visibleCount,
  totalCount,
  onLoadMore,
}: CatalogLoadMoreFooterProps) {
  return (
    <div className='flex flex-col items-center gap-2 pt-2'>
      <p className='text-sm text-muted-foreground tabular-nums'>
        Menampilkan {visibleCount} dari {totalCount} penawaran
      </p>
      <Button
        type='button'
        variant='outline'
        onClick={onLoadMore}
        className='min-h-11 rounded-full border-muted-foreground/45 bg-card px-6 text-sm font-medium text-foreground hover:border-foreground/65 hover:bg-muted/70'
      >
        Lihat banyak lagi
      </Button>
    </div>
  )
}
