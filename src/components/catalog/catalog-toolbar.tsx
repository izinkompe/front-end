'use client'

import { ArrowUpDown, LayoutGrid, Rows3, SlidersHorizontal } from 'lucide-react'
import type { BuyerCategoryFilter } from '@/components/home/hero-search-params'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { mainCategories, type BuyerCategorySlug } from '@/lib/data/categories'
import {
  catalogConditionOptions,
  catalogSortOptions,
  type CatalogFilterState,
  type CatalogSortOption,
  type CatalogViewMode,
} from '@/lib/data/catalog-params'
import { cn } from '@/lib/utils'
import type { CommodityCondition } from '@/types/api/offers'

interface CatalogToolbarProps {
  state: CatalogFilterState
  fixedCategory?: BuyerCategorySlug
  activeFilterCount: number
  onOpenFilterSheet: () => void
  onStateChange: (updater: (prev: CatalogFilterState) => CatalogFilterState) => void
}

const controlSurfaceClassName =
  'min-h-9 rounded-full border border-muted-foreground/45 bg-card px-3 py-1 text-xs font-medium whitespace-nowrap text-foreground transition-colors pointer-coarse:min-h-10 hover:border-foreground/65 hover:bg-muted/70 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:min-h-10 sm:px-3.5 sm:py-1.5 sm:text-sm'

const quickChipClassName = cn(
  controlSurfaceClassName,
  'aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:font-semibold aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90'
)

const toolbarSelectTriggerClassName = cn(
  controlSurfaceClassName,
  'w-full shrink-0 justify-between gap-2 rounded-full! sm:w-auto [&_svg]:text-foreground/80'
)

const filterRowWrapClassName = 'flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2'

const cardLayoutOptions: ReadonlyArray<{
  value: CatalogViewMode
  label: string
}> = [
  { value: 'row', label: 'Baris penuh' },
  { value: 'grid', label: 'Grid' },
]

function isCategoryToken(value: string): value is `cat:${BuyerCategorySlug}` {
  return (
    value === 'cat:sayuran' ||
    value === 'cat:buah' ||
    value === 'cat:padi-biji' ||
    value === 'cat:rempah-umbi'
  )
}

function isConditionToken(value: string): value is `cond:${CommodityCondition}` {
  return (
    value === 'cond:ripe_urgent' ||
    value === 'cond:grade_b' ||
    value === 'cond:surplus' ||
    value === 'cond:imperfect_shape'
  )
}

export function CatalogToolbar({
  state,
  fixedCategory,
  activeFilterCount,
  onOpenFilterSheet,
  onStateChange,
}: CatalogToolbarProps) {
  const selectedSortLabel =
    catalogSortOptions.find((option) => option.value === state.sort)?.label ?? 'Terdekat'
  const selectedLayoutLabel =
    cardLayoutOptions.find((option) => option.value === state.view)?.label ?? 'Baris penuh'

  const primarySelectedTokens: string[] = []
  if (!fixedCategory && state.category !== 'semua') {
    primarySelectedTokens.push(`cat:${state.category}`)
  }
  if (fixedCategory) {
    for (const condition of state.conditions) {
      primarySelectedTokens.push(`cond:${condition}`)
    }
  }

  const secondarySelectedTokens: string[] = []
  if (state.sort === 'expiring') {
    secondarySelectedTokens.push('expiring')
  }
  if (state.dynamicOnly) {
    secondarySelectedTokens.push('dynamic')
  }
  if (state.minStockKg === 50) {
    secondarySelectedTokens.push('stock50')
  }

  function handlePrimaryChange(nextTokens: string[]) {
    if (!fixedCategory) {
      const prevCategoryToken = state.category !== 'semua' ? `cat:${state.category}` : null
      const nextCategoryTokens = nextTokens.filter(isCategoryToken)

      let nextCategory: BuyerCategoryFilter = 'semua'
      if (nextCategoryTokens.length === 1) {
        nextCategory = nextCategoryTokens[0].replace('cat:', '') as BuyerCategorySlug
      } else if (nextCategoryTokens.length > 1) {
        const added = nextCategoryTokens.find((token) => token !== prevCategoryToken)
        nextCategory = added
          ? (added.replace('cat:', '') as BuyerCategorySlug)
          : (nextCategoryTokens[0].replace('cat:', '') as BuyerCategorySlug)
      }

      onStateChange((prev) => ({
        ...prev,
        category: nextCategory,
      }))
      return
    }

    const nextConditions = nextTokens
      .filter(isConditionToken)
      .map((token) => token.replace('cond:', '') as CommodityCondition)

    onStateChange((prev) => ({
      ...prev,
      conditions: nextConditions,
    }))
  }

  function handleSecondaryChange(nextTokens: string[]) {
    const wantsExpiring = nextTokens.includes('expiring')
    const wantsDynamic = nextTokens.includes('dynamic')
    const wantsStock50 = nextTokens.includes('stock50')
    const hadStock50 = state.minStockKg === 50

    onStateChange((prev) => ({
      ...prev,
      sort: wantsExpiring ? 'expiring' : prev.sort === 'expiring' ? 'nearest' : prev.sort,
      dynamicOnly: wantsDynamic,
      minStockKg: wantsStock50 ? 50 : hadStock50 ? null : prev.minStockKg,
    }))
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className={filterRowWrapClassName}>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onOpenFilterSheet}
          className={cn(controlSurfaceClassName, 'shrink-0')}
        >
          <SlidersHorizontal data-icon='inline-start' aria-hidden='true' />
          <span>Semua filter</span>
          {activeFilterCount > 0 && (
            <Badge variant='default' className='ml-0.5 min-h-5 px-2 py-0 text-xs tabular-nums'>
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        <ToggleGroup
          multiple
          variant='default'
          spacing={1}
          value={primarySelectedTokens}
          onValueChange={handlePrimaryChange}
          aria-label={fixedCategory ? 'Filter cepat kondisi' : 'Pilih kategori panen'}
          className={filterRowWrapClassName}
        >
          {!fixedCategory
            ? mainCategories.map((category) => (
                <ToggleGroupItem
                  key={category.slug}
                  value={`cat:${category.slug}`}
                  className={quickChipClassName}
                >
                  {category.shortLabel}
                </ToggleGroupItem>
              ))
            : catalogConditionOptions.map((condition) => (
                <ToggleGroupItem
                  key={condition.value}
                  value={`cond:${condition.value}`}
                  className={quickChipClassName}
                >
                  {condition.shortLabel}
                </ToggleGroupItem>
              ))}
        </ToggleGroup>
      </div>

      <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'>
        <ToggleGroup
          multiple
          variant='default'
          spacing={1}
          value={secondarySelectedTokens}
          onValueChange={handleSecondaryChange}
          aria-label='Filter cepat tambahan'
          className={filterRowWrapClassName}
        >
          <ToggleGroupItem value='expiring' className={quickChipClassName}>
            Segera ditutup
          </ToggleGroupItem>
          <ToggleGroupItem value='dynamic' className={quickChipClassName}>
            Harga turun
          </ToggleGroupItem>
          <ToggleGroupItem value='stock50' className={quickChipClassName}>
            Stok &ge; 50 kg
          </ToggleGroupItem>
        </ToggleGroup>

        <div className='grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center'>
          <Select
            value={state.sort}
            onValueChange={(value) => {
              if (
                value === 'nearest' ||
                value === 'expiring' ||
                value === 'price_asc' ||
                value === 'stock_desc' ||
                value === 'newest'
              ) {
                onStateChange((prev) => ({ ...prev, sort: value as CatalogSortOption }))
              }
            }}
          >
            <SelectTrigger
              size='sm'
              aria-label='Urutkan penawaran'
              className={cn(toolbarSelectTriggerClassName, 'sm:min-w-36')}
            >
              <SelectValue>
                <ArrowUpDown className='size-4 shrink-0' aria-hidden='true' />
                <span className='truncate text-foreground'>{selectedSortLabel}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent align='end'>
              <SelectGroup>
                {catalogSortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={state.view}
            onValueChange={(value) => {
              if (value === 'row' || value === 'grid') {
                onStateChange((prev) => ({ ...prev, view: value as CatalogViewMode }))
              }
            }}
          >
            <SelectTrigger
              size='sm'
              aria-label='Pilih tata letak kartu'
              className={cn(toolbarSelectTriggerClassName, 'sm:min-w-34')}
            >
              <SelectValue>
                {state.view === 'grid' ? (
                  <LayoutGrid className='size-4 shrink-0' aria-hidden='true' />
                ) : (
                  <Rows3 className='size-4 shrink-0' aria-hidden='true' />
                )}
                <span className='truncate text-foreground'>{selectedLayoutLabel}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent align='end'>
              <SelectGroup>
                {cardLayoutOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className='flex items-center gap-2'>
                      {option.value === 'grid' ? (
                        <LayoutGrid className='size-4 shrink-0' aria-hidden='true' />
                      ) : (
                        <Rows3 className='size-4 shrink-0' aria-hidden='true' />
                      )}
                      <span>{option.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
