'use client'

import {
  Apple,
  ArrowUpDown,
  Carrot,
  ChevronDown,
  Clock,
  Flame,
  Layers,
  LayoutGrid,
  Leaf,
  ListFilter,
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const toolbarSelectTriggerClassName = cn(
  controlSurfaceClassName,
  'w-auto min-w-0 max-w-full shrink-0 justify-between gap-2 rounded-full! [&_svg]:text-foreground/80'
)

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

  const activeQuickLabels: string[] = []
  if (!fixedCategory && state.category !== 'semua') {
    const matchedCategory = mainCategories.find((item) => item.slug === state.category)
    if (matchedCategory) {
      activeQuickLabels.push(matchedCategory.shortLabel)
    }
  }
  if (fixedCategory) {
    for (const condition of state.conditions) {
      const matchedCondition = catalogConditionOptions.find((item) => item.value === condition)
      if (matchedCondition) {
        activeQuickLabels.push(matchedCondition.shortLabel)
      }
    }
  }
  if (state.sort === 'expiring') {
    activeQuickLabels.push('Segera ditutup')
  }
  if (state.dynamicOnly) {
    activeQuickLabels.push('Harga turun')
  }
  if (state.minStockKg === 50) {
    activeQuickLabels.push('Stok ≥ 50 kg')
  }

  const quickFilterLabel = activeQuickLabels.length === 1 ? activeQuickLabels[0] : 'Filter cepat'

  function handleConditionToggle(condition: CommodityCondition, checked: boolean) {
    onStateChange((prev) => ({
      ...prev,
      conditions: checked
        ? prev.conditions.includes(condition)
          ? prev.conditions
          : [...prev.conditions, condition]
        : prev.conditions.filter((item) => item !== condition),
    }))
  }

  return (
    <div className='scroll-strip min-w-0 flex-nowrap items-center gap-2'>
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

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type='button'
              aria-label='Filter cepat komoditas'
              className={cn(toolbarSelectTriggerClassName, 'cursor-pointer')}
            />
          }
        >
          <span className='flex items-center gap-2'>
            <ListFilter className='size-4 shrink-0' aria-hidden='true' />
            <span className='truncate text-foreground'>{quickFilterLabel}</span>
            {activeQuickLabels.length > 1 && (
              <Badge variant='default' className='min-h-5 px-1.5 py-0 text-xs tabular-nums'>
                {activeQuickLabels.length}
              </Badge>
            )}
          </span>
          <ChevronDown className='size-4 shrink-0 text-foreground/80' aria-hidden='true' />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='start'
          sideOffset={8}
          collisionPadding={12}
          className='w-64 max-w-[calc(100vw-1.5rem)]'
        >
          {!fixedCategory ? (
            <DropdownMenuGroup>
              <DropdownMenuLabel>Kategori panen</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={state.category}
                onValueChange={(next) => {
                  onStateChange((prev) => ({
                    ...prev,
                    category: next as BuyerCategoryFilter,
                  }))
                }}
              >
                <DropdownMenuRadioItem value='semua'>Semua kategori</DropdownMenuRadioItem>
                {mainCategories.map((category) => {
                  const CategoryIcon = categoryIcons[category.slug]
                  return (
                    <DropdownMenuRadioItem key={category.slug} value={category.slug}>
                      <CategoryIcon className='icon-sm' aria-hidden='true' />
                      <span>{category.shortLabel}</span>
                    </DropdownMenuRadioItem>
                  )
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          ) : (
            <DropdownMenuGroup>
              <DropdownMenuLabel>Kondisi panen</DropdownMenuLabel>
              {catalogConditionOptions.map((condition) => {
                const ConditionIcon = conditionIcons[condition.value]
                return (
                  <DropdownMenuCheckboxItem
                    key={condition.value}
                    checked={state.conditions.includes(condition.value)}
                    onCheckedChange={(checked) => handleConditionToggle(condition.value, checked)}
                  >
                    <ConditionIcon className='icon-sm' aria-hidden='true' />
                    <span>{condition.shortLabel}</span>
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuGroup>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Filter cepat</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={state.sort === 'expiring'}
              onCheckedChange={(checked) => {
                onStateChange((prev) => ({
                  ...prev,
                  sort: checked ? 'expiring' : prev.sort === 'expiring' ? 'nearest' : prev.sort,
                }))
              }}
            >
              <Clock className='icon-sm' aria-hidden='true' />
              <span>Segera ditutup</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={state.dynamicOnly}
              onCheckedChange={(checked) => {
                onStateChange((prev) => ({
                  ...prev,
                  dynamicOnly: checked,
                }))
              }}
            >
              <TrendingDown className='icon-sm' aria-hidden='true' />
              <span>Harga turun</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={state.minStockKg === 50}
              onCheckedChange={(checked) => {
                onStateChange((prev) => ({
                  ...prev,
                  minStockKg: checked ? 50 : prev.minStockKg === 50 ? null : prev.minStockKg,
                }))
              }}
            >
              <Package className='icon-sm' aria-hidden='true' />
              <span>Stok &ge; 50 kg</span>
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

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
  )
}
