'use client'

import { useId, useState } from 'react'
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
  type ColumnDef,
  type PaginationState,
  type RowData,
  type SortingState,
  type TableOptions,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface FarmerTableColumnMeta {
  label?: string
  nowrap?: boolean
  align?: 'start' | 'end'
}

export const farmerTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns,
  sortFns,
  columnMeta: {} as FarmerTableColumnMeta,
})

export function createFarmerColumnHelper<TData extends RowData>() {
  return createColumnHelper<typeof farmerTableFeatures, TData>()
}

interface FarmerDataTableProps<TData extends RowData> {
  data: TData[]
  columns:
    | ReadonlyArray<ColumnDef<typeof farmerTableFeatures, TData, never>>
    | ReadonlyArray<ColumnDef<typeof farmerTableFeatures, TData, string>>
    | ReadonlyArray<ColumnDef<typeof farmerTableFeatures, TData, any>>
  caption: string
  searchPlaceholder?: string
  searchAriaLabel?: string
  filterSlot?: React.ReactNode
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  initialSorting?: SortingState
  pageSize?: number
  rowHeaderColumnId?: string
  getRowId?: (row: TData, index: number) => string
}

export function FarmerDataTable<TData extends RowData>({
  data,
  columns,
  caption,
  searchPlaceholder = 'Cari data...',
  searchAriaLabel = 'Cari di tabel',
  filterSlot,
  emptyTitle,
  emptyDescription,
  emptyAction,
  initialSorting = [],
  pageSize = 10,
  rowHeaderColumnId,
  getRowId,
}: FarmerDataTableProps<TData>) {
  const captionId = useId()
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const [statusAnnouncement, setStatusAnnouncement] = useState('')

  const table = useTable({
    features: farmerTableFeatures,
    data,
    columns: columns as TableOptions<typeof farmerTableFeatures, TData>['columns'],
    getRowId,
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onGlobalFilterChange: (updater) => {
      const next = typeof updater === 'function' ? updater(globalFilter) : updater
      setGlobalFilter(next)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(next)
      const active = next[0]
      if (active) {
        setStatusAnnouncement(
          `Diurutkan berdasarkan ${active.id}, ${active.desc ? 'menurun' : 'menaik'}`
        )
      } else {
        setStatusAnnouncement('Urutan tabel dikembalikan ke bawaan')
      }
    },
    onPaginationChange: setPagination,
  })

  const rows = table.getRowModel().rows
  const totalFiltered = table.getFilteredRowModel().rows.length
  const pageCount = Math.max(1, table.getPageCount())
  const currentPage = pagination.pageIndex + 1
  const startRow = totalFiltered === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const endRow = Math.min(totalFiltered, (pagination.pageIndex + 1) * pagination.pageSize)
  const pageSizeOptions = Array.from(new Set([5, 10, 20, 50, pageSize])).sort((a, b) => a - b)

  const visiblePages = (() => {
    if (pageCount <= 5) {
      return Array.from({ length: pageCount }, (_, index) => index + 1)
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 'ellipsis-end', pageCount] as const
    }
    if (currentPage >= pageCount - 2) {
      return [1, 'ellipsis-start', pageCount - 3, pageCount - 2, pageCount - 1, pageCount] as const
    }
    return [
      1,
      'ellipsis-start',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      'ellipsis-end',
      pageCount,
    ] as const
  })()

  return (
    <div className='flex w-full min-w-0 flex-col gap-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='w-full sm:max-w-sm'>
          <InputGroup>
            <InputGroupAddon>
              <Search aria-hidden='true' />
            </InputGroupAddon>
            <InputGroupInput
              type='search'
              value={globalFilter}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchAriaLabel}
            />
          </InputGroup>
        </div>
        {filterSlot && (
          <div className='flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end'>
            {filterSlot}
          </div>
        )}
      </div>

      <span className='sr-only' role='status' aria-live='polite'>
        {statusAnnouncement}
      </span>

      {rows.length === 0 ? (
        <Empty className='border border-border bg-card'>
          <EmptyHeader>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            {emptyDescription && <EmptyDescription>{emptyDescription}</EmptyDescription>}
          </EmptyHeader>
          {emptyAction && <EmptyContent>{emptyAction}</EmptyContent>}
        </Empty>
      ) : (
        <div className='flex w-full min-w-0 flex-col gap-3 rounded-xl border border-border bg-card'>
          <Table
            responsiveLayout='scroll'
            stickyRowHeader={Boolean(rowHeaderColumnId)}
            aria-labelledby={captionId}
          >
            <TableCaption id={captionId} className='sr-only'>
              {caption}
            </TableCaption>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    const sortDirection = header.column.getIsSorted()
                    const ariaSort =
                      sortDirection === 'asc'
                        ? 'ascending'
                        : sortDirection === 'desc'
                          ? 'descending'
                          : undefined
                    const meta = header.column.columnDef.meta

                    return (
                      <TableHead
                        key={header.id}
                        scope='col'
                        aria-sort={ariaSort}
                        className={cn(canSort && 'p-0', meta?.align === 'end' && 'text-end')}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              'min-h-11 w-full justify-start rounded-none px-3 font-medium text-foreground',
                              meta?.align === 'end' && 'justify-end text-end'
                            )}
                          >
                            <span>
                              <table.FlexRender header={header} />
                            </span>
                            {sortDirection === 'asc' ? (
                              <ArrowUp
                                data-icon='inline-end'
                                className='text-primary'
                                aria-hidden='true'
                              />
                            ) : sortDirection === 'desc' ? (
                              <ArrowDown
                                data-icon='inline-end'
                                className='text-primary'
                                aria-hidden='true'
                              />
                            ) : (
                              <ArrowUpDown
                                data-icon='inline-end'
                                className='text-muted-foreground'
                                aria-hidden='true'
                              />
                            )}
                          </Button>
                        ) : (
                          <table.FlexRender header={header} />
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    const headerText =
                      meta?.label ??
                      (typeof cell.column.columnDef.header === 'string'
                        ? cell.column.columnDef.header
                        : undefined)
                    const isRowHeader = rowHeaderColumnId === cell.column.id

                    if (isRowHeader) {
                      return (
                        <TableHead
                          key={cell.id}
                          scope='row'
                          className='min-w-40 max-w-60 whitespace-normal font-medium'
                        >
                          <table.FlexRender cell={cell} />
                        </TableHead>
                      )
                    }

                    return (
                      <TableCell
                        key={cell.id}
                        label={headerText}
                        nowrap={meta?.nowrap}
                        className={cn(meta?.align === 'end' && 'text-end')}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className='flex flex-col gap-3 border-t border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4'>
            <div className='flex flex-wrap items-center justify-between gap-3 sm:justify-start'>
              <div className='flex items-center gap-2'>
                <span className='text-meta text-muted-foreground'>Tampilkan</span>
                <Select
                  value={String(pagination.pageSize)}
                  onValueChange={(value) => {
                    if (!value) return
                    setPagination({ pageIndex: 0, pageSize: Number(value) })
                  }}
                >
                  <SelectTrigger size='sm' aria-label='Jumlah baris per halaman' className='w-20'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className='text-meta text-muted-foreground tabular-nums'>
                {startRow}–{endRow} dari {totalFiltered} data
              </p>
            </div>

            <div className='flex items-center justify-between gap-1.5 sm:justify-end'>
              <Button
                type='button'
                variant='outline'
                size='icon-sm'
                aria-label='Halaman sebelumnya'
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <ChevronLeft aria-hidden='true' />
              </Button>
              <div className='flex items-center gap-1'>
                {visiblePages.map((item) =>
                  typeof item === 'number' ? (
                    <Button
                      key={item}
                      type='button'
                      variant={item === currentPage ? 'default' : 'outline'}
                      size='icon-sm'
                      aria-label={`Halaman ${item}`}
                      aria-current={item === currentPage ? 'page' : undefined}
                      onClick={() => table.setPageIndex(item - 1)}
                      className='tabular-nums'
                    >
                      {item}
                    </Button>
                  ) : (
                    <span
                      key={item}
                      aria-hidden='true'
                      className='px-1 text-meta text-muted-foreground'
                    >
                      …
                    </span>
                  )
                )}
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon-sm'
                aria-label='Halaman berikutnya'
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <ChevronRight aria-hidden='true' />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
