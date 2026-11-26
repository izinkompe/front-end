'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlarmClock,
  Apple,
  Boxes,
  CalendarClock,
  Carrot,
  Clock,
  Compass,
  Globe,
  Hourglass,
  Layers,
  LayoutGrid,
  Leaf,
  LocateFixed,
  MapPin,
  Navigation,
  Package,
  Search,
  ShoppingBasket,
  Truck,
  Wheat,
  type LucideIcon,
} from 'lucide-react'
import { useSelectedLocation } from '@/components/providers/location-provider'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useOffers } from '@/hooks/api/use-offers'
import { HeroFilterSelect, PickupCalendarPopover } from './hero-filter-controls'
import { HeroSearchCombobox } from './hero-search-combobox'
import type { CommoditySuggestion, OfferSuggestion } from './hero-search-suggestions'
import {
  buildBuyerSearchHref,
  categoryFilterOptions,
  deadlineOptions,
  formatPickupDateIso,
  minStockOptions,
  radiusOptions,
  type BuyerCategoryFilter,
  type BuyerDeadlineOption,
  type BuyerMinStockOption,
  type BuyerRadiusOption,
  type BuyerSearchMode,
} from './hero-search-params'

const searchModes: ReadonlyArray<{
  value: BuyerSearchMode
  label: string
  ctaLabel: string
}> = [
  { value: 'katalog', label: 'Cari panen', ctaLabel: 'Cari panen' },
  { value: 'peta', label: 'Peta radius', ctaLabel: 'Buka peta' },
  { value: 'segera-ditutup', label: 'Segera ditutup', ctaLabel: 'Lihat penawaran' },
]

const categoryIcons: Record<BuyerCategoryFilter, LucideIcon> = {
  semua: LayoutGrid,
  sayuran: Leaf,
  buah: Apple,
  'padi-biji': Wheat,
  'rempah-umbi': Carrot,
}

const radiusIcons: Record<BuyerRadiusOption, LucideIcon> = {
  '5': LocateFixed,
  '10': MapPin,
  '25': Compass,
  '50': Globe,
}

const minStockIcons: Record<BuyerMinStockOption, LucideIcon> = {
  semua: Layers,
  '10': ShoppingBasket,
  '25': Package,
  '50': Boxes,
  '100': Truck,
}

const deadlineIcons: Record<BuyerDeadlineOption, LucideIcon> = {
  semua: Clock,
  '3h': AlarmClock,
  '6h': Hourglass,
  today: CalendarClock,
}

function getTodayStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function BuyerHeroSearch() {
  const router = useRouter()
  const { selectedLocation, hasUpdatedLocation, locating, locationMessage, detectCurrentLocation } =
    useSelectedLocation()
  const { data: offers = [] } = useOffers()

  const [mode, setMode] = useState<BuyerSearchMode>('katalog')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<BuyerCategoryFilter>('semua')
  const [radiusKm, setRadiusKm] = useState<BuyerRadiusOption>('10')
  const [minStockKg, setMinStockKg] = useState<BuyerMinStockOption>('semua')
  const [deadlineWindow, setDeadlineWindow] = useState<BuyerDeadlineOption>('semua')
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [today, setToday] = useState<Date | undefined>(undefined)

  const activeModeMeta = searchModes.find((item) => item.value === mode) ?? searchModes[0]

  function handleModeChange(nextValues: string[]) {
    const next = nextValues[0]
    if (next === 'katalog' || next === 'peta' || next === 'segera-ditutup') {
      setMode(next)
      setCalendarOpen(false)
    }
  }

  function handleCategoryChange(nextValue: string | null) {
    if (
      nextValue === 'semua' ||
      nextValue === 'sayuran' ||
      nextValue === 'buah' ||
      nextValue === 'padi-biji' ||
      nextValue === 'rempah-umbi'
    ) {
      setCategory(nextValue)
    }
  }

  function handleRadiusChange(nextValue: string | null) {
    if (nextValue === '5' || nextValue === '10' || nextValue === '25' || nextValue === '50') {
      setRadiusKm(nextValue)
    }
  }

  function handleMinStockChange(nextValue: string | null) {
    if (
      nextValue === 'semua' ||
      nextValue === '10' ||
      nextValue === '25' ||
      nextValue === '50' ||
      nextValue === '100'
    ) {
      setMinStockKg(nextValue)
    }
  }

  function handleDeadlineChange(nextValue: string | null) {
    if (
      nextValue === 'semua' ||
      nextValue === '3h' ||
      nextValue === '6h' ||
      nextValue === 'today'
    ) {
      setDeadlineWindow(nextValue)
    }
  }

  function handleCalendarOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setToday(getTodayStart())
    }
    setCalendarOpen(nextOpen)
  }

  function handleSelectPickupDate(nextDate: Date | undefined) {
    setPickupDate(nextDate)
    setCalendarOpen(false)
  }

  function handleSelectToday() {
    setPickupDate(today ?? getTodayStart())
    setCalendarOpen(false)
  }

  function handleClearPickupDate() {
    setPickupDate(undefined)
    setCalendarOpen(false)
  }

  function navigateSearch(nextQuery: string, nextCategory: BuyerCategoryFilter = category) {
    const href = buildBuyerSearchHref({
      mode,
      query: nextQuery,
      category: nextCategory,
      radiusKm,
      minStockKg,
      deadlineWindow,
      pickupDate: pickupDate ? formatPickupDateIso(pickupDate) : null,
      location: selectedLocation,
    })
    router.push(href)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigateSearch(query)
  }

  function handleSelectCommodity(commodity: CommoditySuggestion) {
    const nextCategory = mode === 'katalog' ? commodity.categorySlug : category
    setQuery(commodity.label)
    if (mode === 'katalog') {
      setCategory(commodity.categorySlug)
    }
    navigateSearch(commodity.label, nextCategory)
  }

  function handleSelectOffer(offer: OfferSuggestion) {
    router.push(offer.href)
  }

  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col items-center'>
      <ToggleGroup
        variant='default'
        spacing={1}
        value={[mode]}
        onValueChange={handleModeChange}
        aria-label='Mode pencarian panen'
        className='relative z-10 -mb-6 max-w-full flex-nowrap overflow-x-auto rounded-full border border-border/80 bg-card p-1.5 shadow-md'
      >
        <ToggleGroupItem
          value='katalog'
          className='min-h-10 shrink-0 whitespace-nowrap rounded-full px-3 text-xs font-medium text-foreground/75 hover:bg-muted hover:text-foreground aria-pressed:bg-primary/12 aria-pressed:font-semibold aria-pressed:text-primary sm:px-4 sm:text-sm dark:aria-pressed:bg-primary/25 dark:aria-pressed:text-primary-foreground'
        >
          <Search data-icon='inline-start' aria-hidden='true' />
          <span>Cari panen</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value='peta'
          className='min-h-10 shrink-0 whitespace-nowrap rounded-full px-3 text-xs font-medium text-foreground/75 hover:bg-muted hover:text-foreground aria-pressed:bg-primary/12 aria-pressed:font-semibold aria-pressed:text-primary sm:px-4 sm:text-sm dark:aria-pressed:bg-primary/25 dark:aria-pressed:text-primary-foreground'
        >
          <MapPin data-icon='inline-start' aria-hidden='true' />
          <span>Peta radius</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value='segera-ditutup'
          className='min-h-10 shrink-0 whitespace-nowrap rounded-full px-3 text-xs font-medium text-foreground/75 hover:bg-muted hover:text-foreground aria-pressed:bg-primary/12 aria-pressed:font-semibold aria-pressed:text-primary sm:px-4 sm:text-sm dark:aria-pressed:bg-primary/25 dark:aria-pressed:text-primary-foreground'
        >
          <Clock data-icon='inline-start' aria-hidden='true' />
          <span>Segera ditutup</span>
        </ToggleGroupItem>
      </ToggleGroup>

      <div className='w-full rounded-2xl border border-border/80 bg-card px-4 pt-10 pb-4 text-card-foreground shadow-xl sm:px-6 sm:pt-11 sm:pb-5'>
        <form
          onSubmit={handleSubmit}
          role='search'
          aria-label='Pencarian panen surplus'
          className='grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.95fr)_minmax(0,0.95fr)_auto] lg:items-center'
        >
          <HeroSearchCombobox
            query={query}
            onQueryChange={setQuery}
            offers={offers}
            onSubmitQuery={(nextQuery) => navigateSearch(nextQuery)}
            onSelectCommodity={handleSelectCommodity}
            onSelectOffer={handleSelectOffer}
          />

          {mode === 'katalog' && (
            <>
              <HeroFilterSelect
                value={category}
                onValueChange={handleCategoryChange}
                options={categoryFilterOptions}
                icons={categoryIcons}
                ariaLabel='Pilih kategori komoditas'
                fallbackLabel='Semua kategori'
              />

              <PickupCalendarPopover
                open={calendarOpen}
                onOpenChange={handleCalendarOpenChange}
                selectedDate={pickupDate}
                today={today}
                onSelectDate={handleSelectPickupDate}
                onSelectToday={handleSelectToday}
                onClearDate={handleClearPickupDate}
              />
            </>
          )}

          {mode === 'peta' && (
            <>
              <HeroFilterSelect
                value={radiusKm}
                onValueChange={handleRadiusChange}
                options={radiusOptions}
                icons={radiusIcons}
                ariaLabel='Pilih radius jarak pencarian'
                fallbackLabel='Radius 10 km'
              />

              <HeroFilterSelect
                value={minStockKg}
                onValueChange={handleMinStockChange}
                options={minStockOptions}
                icons={minStockIcons}
                ariaLabel='Pilih minimum stok tersedia'
                fallbackLabel='Semua stok'
              />
            </>
          )}

          {mode === 'segera-ditutup' && (
            <>
              <HeroFilterSelect
                value={deadlineWindow}
                onValueChange={handleDeadlineChange}
                options={deadlineOptions}
                icons={deadlineIcons}
                ariaLabel='Pilih batas waktu pemesanan'
                fallbackLabel='Semua batas waktu'
              />

              <PickupCalendarPopover
                open={calendarOpen}
                onOpenChange={handleCalendarOpenChange}
                selectedDate={pickupDate}
                today={today}
                onSelectDate={handleSelectPickupDate}
                onSelectToday={handleSelectToday}
                onClearDate={handleClearPickupDate}
              />
            </>
          )}

          <Button
            type='submit'
            size='lg'
            className='min-h-12 w-full px-6 sm:col-span-2 lg:col-span-1 lg:w-auto'
          >
            {activeModeMeta.ctaLabel}
          </Button>
        </form>

        <div className='mt-4 flex flex-col items-center justify-between gap-1.5 border-t border-border/80 pt-3.5 text-center sm:flex-row sm:text-left'>
          <div className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-foreground/75 sm:justify-start sm:text-sm'>
            <span>
              {hasUpdatedLocation
                ? `Lokasi acuan memakai ${selectedLocation.label}.`
                : `Lokasi acuan saat ini di ${selectedLocation.label}. Bukan di sana?`}
            </span>

            <button
              type='button'
              onClick={() => detectCurrentLocation()}
              disabled={locating}
              className='inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-primary transition-opacity pointer-coarse:min-h-11 hover:underline underline-offset-4 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sidebar-primary'
            >
              <Navigation className='size-4 shrink-0 fill-current' aria-hidden='true' />
              <span>
                {locating
                  ? 'Mendeteksi lokasi...'
                  : hasUpdatedLocation
                    ? 'Perbarui lokasi'
                    : 'Gunakan lokasi saat ini'}
              </span>
            </button>
          </div>

          {locationMessage && (
            <p role='status' aria-live='polite' className='text-sm text-foreground/75'>
              {locationMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
