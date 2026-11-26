'use client'

import {
  Apple,
  ArrowUpDown,
  Carrot,
  Clock,
  Flame,
  Layers,
  LayoutGrid,
  Leaf,
  Package,
  Rows3,
  Scale,
  Shapes,
  SlidersHorizontal,
  TrendingDown,
  Wheat,
  type LucideIcon,
} from 'lucide-react'
import type { BuyerCategoryFilter } from '@/components/home/hero-search-params'
import { Badge } from '@/components/ui/badge'
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

const controlSurfaceClassName = 'pill-control border-muted-foreground/45 hover:border-foreground/65'

const quickChipClassName = 'chip-toggle border-muted-foreground/45 hover:border-foreground/65'

const toolbarSelectTriggerClassName = cn(
  controlSurfaceClassName,
  'w-full min-w-0 max-w-full shrink-0 justify-between gap-2 rounded-full! sm:w-auto [&_svg]:text-foreground/80'
)

const filterRowWrapClassName = 'scroll-strip min-w-0 flex-nowrap gap-1.5 sm:gap-2'

const cardLayoutOptions: ReadonlyArray<{
  value: CatalogViewMode
  label: string
}> = [
  { value: 'row', label: 'Baris penuh' },
  { value: 'grid', label: 'Grid' },
]

const categoryIcons: Record<BuyerCategorySlug, LucideIcon> = {
  sayuran: Leaf,
  buah: Apple,
  'padi-biji': Wheat,
  'rempah-umbi': Carrot,
}

const conditionIcons: Record<CommodityCondition, LucideIcon> = {
  ripe_urgent: Flame,
  grade_b: Scale,
  surplus: Layers,
  imperfect_shape: Shapes,
}

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
    <div className='flex flex-col gap-2.5'>
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
          ? mainCategories.map((category) => {
              const CategoryIcon = categoryIcons[category.slug]
              return (
                <ToggleGroupItem
                  key={category.slug}
                  value={`cat:${category.slug}`}
                  className={quickChipClassName}
                >
                  <CategoryIcon className='icon-sm' aria-hidden='true' />
                  <span>{category.shortLabel}</span>
                </ToggleGroupItem>
              )
            })
          : catalogConditionOptions.map((condition) => {
              const ConditionIcon = conditionIcons[condition.value]
              return (
                <ToggleGroupItem
                  key={condition.value}
                  value={`cond:${condition.value}`}
                  className={quickChipClassName}
                >
                  <ConditionIcon className='icon-sm' aria-hidden='true' />
                  <span>{condition.shortLabel}</span>
                </ToggleGroupItem>
              )
            })}
      </ToggleGroup>

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
          <Clock className='icon-sm' aria-hidden='true' />
          <span>Segera ditutup</span>
        </ToggleGroupItem>
        <ToggleGroupItem value='dynamic' className={quickChipClassName}>
          <TrendingDown className='icon-sm' aria-hidden='true' />
          <span>Harga turun</span>
        </ToggleGroupItem>
        <ToggleGroupItem value='stock50' className={quickChipClassName}>
          <Package className='icon-sm' aria-hidden='true' />
          <span>Stok &ge; 50 kg</span>
        </ToggleGroupItem>
      </ToggleGroup>

      <div className='flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={onOpenFilterSheet}
          className={cn(controlSurfaceClassName, 'shrink-0 cursor-pointer')}
        >
          <SlidersHorizontal className='icon-sm' aria-hidden='true' />
          <span>Semua filter</span>
          {activeFilterCount > 0 && (
            <Badge variant='default' className='ml-0.5 min-h-5 px-2 py-0 text-xs tabular-nums'>
              {activeFilterCount}
            </Badge>
          )}
        </button>

        <div className='flex min-w-0 flex-1 items-center gap-2 sm:flex-none'>
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
              className={cn(toolbarSelectTriggerClassName, 'hidden sm:inline-flex sm:min-w-34')}
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
