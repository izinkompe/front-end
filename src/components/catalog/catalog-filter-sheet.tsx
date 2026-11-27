'use client'

import { useState } from 'react'
import {
  categoryFilterOptions,
  deadlineOptions,
  formatPickupDateIso,
  formatPickupDateLabel,
  type BuyerCategoryFilter,
  type BuyerDeadlineOption,
  type BuyerRadiusOption,
} from '@/components/home/hero-search-params'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CommoditySearchInput } from '@/components/shared/commodity-search-input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { BuyerCategorySlug } from '@/lib/data/categories'
import {
  catalogConditionOptions,
  catalogMinStockOptions,
  catalogRadiusOptions,
  clearAllCatalogFilters,
  type CatalogFilterState,
} from '@/lib/data/catalog-filters'
import {
  catalogSortOptions,
  type CatalogSortOption,
  type CatalogViewMode,
} from '@/lib/data/catalog-params'
import type { CommodityCondition } from '@/types/api/offers'

interface CatalogFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: CatalogFilterState
  fixedCategory?: BuyerCategorySlug
  onApply: (nextState: CatalogFilterState) => void
}

function getTodayStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function parseIsoDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function FilterSheetBody({
  initialState,
  fixedCategory,
  onApply,
  onClose,
}: {
  initialState: CatalogFilterState
  fixedCategory?: BuyerCategorySlug
  onApply: (nextState: CatalogFilterState) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<CatalogFilterState>(initialState)
  const [minPriceText, setMinPriceText] = useState(
    initialState.minPrice !== null ? String(initialState.minPrice) : ''
  )
  const [maxPriceText, setMaxPriceText] = useState(
    initialState.maxPrice !== null ? String(initialState.maxPrice) : ''
  )
  const [today] = useState<Date>(() => getTodayStart())

  const selectedDate = parseIsoDate(draft.pickupDate)
  const pickupDateLabel = selectedDate ? formatPickupDateLabel(selectedDate) : 'Semua jadwal'

  const minStockValue = draft.minStockKg !== null ? String(draft.minStockKg) : 'semua'
  const minStockLabel =
    catalogMinStockOptions.find((item) => item.value === minStockValue)?.label ?? 'Semua stok'

  const radiusValue = draft.radiusKm ?? 'semua'
  const radiusLabel =
    catalogRadiusOptions.find((item) => item.value === radiusValue)?.label ?? 'Semua jarak'

  const deadlineLabel =
    deadlineOptions.find((item) => item.value === draft.deadlineWindow)?.label ??
    'Semua batas waktu'
  const sortLabel =
    catalogSortOptions.find((item) => item.value === draft.sort)?.label ?? 'Terdekat'
  const viewLabel = draft.view === 'grid' ? 'Grid' : 'Baris penuh'

  const categoryLabel =
    categoryFilterOptions.find((item) => item.value === draft.category)?.label ?? 'Semua kategori'

  function handleToggleCondition(condition: CommodityCondition, checked: boolean) {
    setDraft((prev) => ({
      ...prev,
      conditions: checked
        ? Array.from(new Set([...prev.conditions, condition]))
        : prev.conditions.filter((item) => item !== condition),
    }))
  }

  function parseOptionalPrice(raw: string): number | null {
    const trimmed = raw.trim()
    if (!trimmed) return null
    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed) || parsed <= 0) return null
    return Math.round(parsed)
  }

  function handleReset() {
    const cleared = clearAllCatalogFilters(draft, fixedCategory)
    setDraft(cleared)
    setMinPriceText('')
    setMaxPriceText('')
  }

  function handleSubmit() {
    const minPrice = parseOptionalPrice(minPriceText)
    const maxPrice = parseOptionalPrice(maxPriceText)
    const normalizedMin =
      minPrice !== null && maxPrice !== null && minPrice > maxPrice ? maxPrice : minPrice
    const normalizedMax =
      minPrice !== null && maxPrice !== null && minPrice > maxPrice ? minPrice : maxPrice

    onApply({
      ...draft,
      minPrice: normalizedMin,
      maxPrice: normalizedMax,
    })
    onClose()
  }

  return (
    <>
      <ScrollArea className='min-h-0 flex-1 overscroll-contain'>
        <div className='px-5 py-5'>
          <FieldGroup className='gap-6'>
            <Field>
              <FieldLabel htmlFor='filter-search-query'>Cari komoditas atau wilayah</FieldLabel>
              <CommoditySearchInput
                id='filter-search-query'
                value={draft.q}
                onChange={(nextQuery) => setDraft((prev) => ({ ...prev, q: nextQuery }))}
                placeholder='Cari tomat, buncis, mangga...'
                ariaLabel='Cari nama komoditas atau wilayah'
                className='min-h-11'
              />
            </Field>

            <Field>
              <FieldLabel htmlFor='filter-sort'>Urutkan penawaran</FieldLabel>
              <Select
                value={draft.sort}
                onValueChange={(value) => {
                  if (
                    value === 'nearest' ||
                    value === 'expiring' ||
                    value === 'price_asc' ||
                    value === 'stock_desc' ||
                    value === 'newest'
                  ) {
                    setDraft((prev) => ({ ...prev, sort: value as CatalogSortOption }))
                  }
                }}
              >
                <SelectTrigger id='filter-sort' className='w-full'>
                  <SelectValue>{sortLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {catalogSortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field className='hidden sm:flex'>
              <FieldLabel htmlFor='filter-view'>Tata letak kartu</FieldLabel>
              <Select
                value={draft.view}
                onValueChange={(value) => {
                  if (value === 'row' || value === 'grid') {
                    setDraft((prev) => ({ ...prev, view: value as CatalogViewMode }))
                  }
                }}
              >
                <SelectTrigger id='filter-view' className='w-full'>
                  <SelectValue>{viewLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='row'>Baris penuh</SelectItem>
                    <SelectItem value='grid'>Grid</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {!fixedCategory && (
              <Field>
                <FieldLabel htmlFor='filter-category'>Kategori komoditas</FieldLabel>
                <Select
                  value={draft.category}
                  onValueChange={(value) => {
                    if (
                      value === 'semua' ||
                      value === 'sayuran' ||
                      value === 'buah' ||
                      value === 'padi-biji' ||
                      value === 'rempah-umbi'
                    ) {
                      setDraft((prev) => ({ ...prev, category: value as BuyerCategoryFilter }))
                    }
                  }}
                >
                  <SelectTrigger id='filter-category' className='w-full'>
                    <SelectValue>{categoryLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categoryFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}

            <FieldSet>
              <FieldLegend variant='label'>Kondisi pangan</FieldLegend>
              <div className='flex flex-col gap-3'>
                {catalogConditionOptions.map((option) => {
                  const checkboxId = `filter-condition-${option.value}`
                  const isChecked = draft.conditions.includes(option.value)
                  return (
                    <Field
                      key={option.value}
                      orientation='horizontal'
                      className='items-center gap-3'
                    >
                      <Checkbox
                        id={checkboxId}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleToggleCondition(option.value, Boolean(checked))
                        }
                      />
                      <FieldLabel htmlFor={checkboxId} className='font-normal'>
                        {option.label}
                      </FieldLabel>
                    </Field>
                  )
                })}
              </div>
            </FieldSet>

            <FieldSet>
              <FieldLegend variant='label'>Rentang harga per kilogram</FieldLegend>
              <div className='grid grid-cols-2 gap-3'>
                <Field>
                  <FieldLabel htmlFor='filter-min-price' className='text-sm text-muted-foreground'>
                    Minimal
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align='inline-start'>
                      <InputGroupText>Rp</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id='filter-min-price'
                      type='number'
                      inputMode='numeric'
                      min={0}
                      step={500}
                      placeholder='5000'
                      value={minPriceText}
                      onChange={(event) => setMinPriceText(event.target.value)}
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor='filter-max-price' className='text-sm text-muted-foreground'>
                    Maksimal
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align='inline-start'>
                      <InputGroupText>Rp</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id='filter-max-price'
                      type='number'
                      inputMode='numeric'
                      min={0}
                      step={500}
                      placeholder='25000'
                      value={maxPriceText}
                      onChange={(event) => setMaxPriceText(event.target.value)}
                    />
                  </InputGroup>
                </Field>
              </div>
            </FieldSet>

            <Field>
              <FieldLabel htmlFor='filter-min-stock'>Stok minimal tersedia</FieldLabel>
              <Select
                value={minStockValue}
                onValueChange={(value) => {
                  if (!value || value === 'semua') {
                    setDraft((prev) => ({ ...prev, minStockKg: null }))
                    return
                  }
                  const parsed = Number(value)
                  if (Number.isFinite(parsed) && parsed > 0) {
                    setDraft((prev) => ({ ...prev, minStockKg: parsed }))
                  }
                }}
              >
                <SelectTrigger id='filter-min-stock' className='w-full'>
                  <SelectValue>{minStockLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {catalogMinStockOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor='filter-radius'>Jarak garis lurus dari lokasi acuan</FieldLabel>
              <Select
                value={radiusValue}
                onValueChange={(value) => {
                  if (!value || value === 'semua') {
                    setDraft((prev) => ({ ...prev, radiusKm: null }))
                    return
                  }
                  if (value === '5' || value === '10' || value === '25' || value === '50') {
                    setDraft((prev) => ({ ...prev, radiusKm: value as BuyerRadiusOption }))
                  }
                }}
              >
                <SelectTrigger id='filter-radius' className='w-full'>
                  <SelectValue>{radiusLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {catalogRadiusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor='filter-deadline'>Batas waktu pemesanan</FieldLabel>
              <Select
                value={draft.deadlineWindow}
                onValueChange={(value) => {
                  if (value === 'semua' || value === '3h' || value === '6h' || value === 'today') {
                    setDraft((prev) => ({ ...prev, deadlineWindow: value as BuyerDeadlineOption }))
                  }
                }}
              >
                <SelectTrigger id='filter-deadline' className='w-full'>
                  <SelectValue>{deadlineLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {deadlineOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor='filter-pickup-date'>Tanggal jadwal ambil mandiri</FieldLabel>
              <DatePicker
                id='filter-pickup-date'
                value={selectedDate}
                onValueChange={(date) =>
                  setDraft((prev) => ({
                    ...prev,
                    pickupDate: date ? formatPickupDateIso(date) : null,
                  }))
                }
                defaultMonth={selectedDate ?? today}
                disabled={{ before: today }}
                displayValue={pickupDateLabel}
                showTodayAction
                onToday={() =>
                  setDraft((prev) => ({ ...prev, pickupDate: formatPickupDateIso(today) }))
                }
                showClearAction
                clearLabel='Semua jadwal'
                onClear={() => setDraft((prev) => ({ ...prev, pickupDate: null }))}
              />
            </Field>

            <Field orientation='horizontal' className='items-center gap-3'>
              <Checkbox
                id='filter-dynamic-only'
                checked={draft.dynamicOnly}
                onCheckedChange={(checked) =>
                  setDraft((prev) => ({ ...prev, dynamicOnly: Boolean(checked) }))
                }
              />
              <FieldLabel htmlFor='filter-dynamic-only' className='font-normal'>
                Hanya harga turun terjadwal
              </FieldLabel>
            </Field>
          </FieldGroup>
        </div>
      </ScrollArea>

      <SheetFooter className='sticky-bar-safe flex-row gap-3 bg-background px-4 pt-4'>
        <Button type='button' variant='outline' className='flex-1' onClick={handleReset}>
          Atur ulang
        </Button>
        <Button type='button' variant='default' className='flex-1' onClick={handleSubmit}>
          Terapkan filter
        </Button>
      </SheetFooter>
    </>
  )
}

export function CatalogFilterSheet({
  open,
  onOpenChange,
  state,
  fixedCategory,
  onApply,
}: CatalogFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='left'
        className='flex h-dvh w-full! max-w-full! flex-col gap-0 p-0 sm:max-w-md!'
      >
        <SheetHeader className='border-b border-border px-5 py-4 pr-12'>
          <SheetTitle>Semua filter</SheetTitle>
          <SheetDescription>
            Saring panen menurut kondisi, harga per kilogram, stok, dan jadwal ambil.
          </SheetDescription>
        </SheetHeader>

        {open && (
          <FilterSheetBody
            key='open'
            initialState={state}
            fixedCategory={fixedCategory}
            onApply={onApply}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
