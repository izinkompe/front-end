'use client'

import { useState } from 'react'
import { id } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
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
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
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
  const [calendarOpen, setCalendarOpen] = useState(false)
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
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      id='filter-pickup-date'
                      type='button'
                      variant='outline'
                      className='w-full justify-between font-normal'
                    />
                  }
                >
                  <span className='flex min-w-0 items-center gap-2'>
                    <CalendarIcon data-icon='inline-start' aria-hidden='true' />
                    <span className='truncate'>{pickupDateLabel}</span>
                  </span>
                  <ChevronDown aria-hidden='true' className='size-4 text-muted-foreground' />
                </PopoverTrigger>
                <PopoverContent align='start' className='w-auto min-w-80 gap-0 p-0'>
                  <Calendar
                    mode='single'
                    selected={selectedDate}
                    onSelect={(date) => {
                      setDraft((prev) => ({
                        ...prev,
                        pickupDate: date ? formatPickupDateIso(date) : null,
                      }))
                      setCalendarOpen(false)
                    }}
                    defaultMonth={selectedDate ?? today}
                    disabled={{ before: today }}
                    locale={id}
                    className='w-full'
                    classNames={{ root: 'w-full' }}
                  />
                  <Separator />
                  <div className='flex items-center justify-between gap-2 p-2.5'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setDraft((prev) => ({ ...prev, pickupDate: formatPickupDateIso(today) }))
                        setCalendarOpen(false)
                      }}
                    >
                      Hari ini
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      disabled={!draft.pickupDate}
                      onClick={() => {
                        setDraft((prev) => ({ ...prev, pickupDate: null }))
                        setCalendarOpen(false)
                      }}
                    >
                      Semua jadwal
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
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

      <Separator />

      <SheetFooter className='flex-row gap-3 bg-background p-4'>
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
      <SheetContent side='left' className='flex h-svh w-full flex-col gap-0 p-0 sm:max-w-md'>
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
