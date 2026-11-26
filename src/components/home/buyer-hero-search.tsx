'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { id } from 'date-fns/locale'
import {
  AlarmClock,
  Apple,
  Boxes,
  Calendar as CalendarIcon,
  CalendarClock,
  Carrot,
  ChevronDown,
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
import { Calendar } from '@/components/ui/calendar'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  buildBuyerSearchHref,
  categoryFilterOptions,
  deadlineOptions,
  formatPickupDateIso,
  formatPickupDateLabel,
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
  { value: 'katalog', label: 'Cari Panen', ctaLabel: 'Cari Panen' },
  { value: 'peta', label: 'Peta Radius', ctaLabel: 'Lihat Peta' },
  { value: 'segera-ditutup', label: 'Segera Ditutup', ctaLabel: 'Lihat Penawaran' },
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

const controlTriggerClassName =
  'min-h-12 w-full border-input bg-background text-foreground hover:bg-muted/50 dark:bg-input/30 dark:hover:bg-input/50'

const controlIconClassName = 'size-4 shrink-0 text-muted-foreground'

interface HeroFilterSelectProps<T extends string> {
  value: T
  onValueChange: (value: string | null) => void
  options: ReadonlyArray<{ value: T; label: string }>
  icons: Record<T, LucideIcon>
  ariaLabel: string
  fallbackLabel: string
}

function HeroFilterSelect<T extends string>({
  value,
  onValueChange,
  options,
  icons,
  ariaLabel,
  fallbackLabel,
}: HeroFilterSelectProps<T>) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? fallbackLabel
  const SelectedIcon: LucideIcon = icons[value]

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={controlTriggerClassName} aria-label={ariaLabel}>
        <SelectValue>
          <SelectedIcon className={controlIconClassName} aria-hidden='true' />
          <span className='truncate text-foreground'>{selectedLabel}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => {
            const OptionIcon: LucideIcon = icons[option.value]
            return (
              <SelectItem key={option.value} value={option.value}>
                <span className='flex items-center gap-2'>
                  <OptionIcon className={controlIconClassName} aria-hidden='true' />
                  <span>{option.label}</span>
                </span>
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function getTodayStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

interface PickupCalendarPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | undefined
  today: Date | undefined
  onSelectDate: (date: Date | undefined) => void
  onSelectToday: () => void
  onClearDate: () => void
}

function PickupCalendarPopover({
  open,
  onOpenChange,
  selectedDate,
  today,
  onSelectDate,
  onSelectToday,
  onClearDate,
}: PickupCalendarPopoverProps) {
  const pickupDateLabel = selectedDate ? formatPickupDateLabel(selectedDate) : 'Semua jadwal'

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type='button'
            variant='outline'
            className={`${controlTriggerClassName} justify-between py-2 pr-3 pl-3.5 font-normal hover:text-foreground aria-expanded:bg-muted/50 aria-expanded:text-foreground`}
            aria-label='Pilih tanggal jadwal pengambilan mandiri'
          />
        }
      >
        <span className='flex min-w-0 items-center gap-2'>
          <CalendarIcon className={controlIconClassName} aria-hidden='true' />
          <span className='truncate text-foreground'>{pickupDateLabel}</span>
        </span>
        <ChevronDown className={controlIconClassName} aria-hidden='true' />
      </PopoverTrigger>

      <PopoverContent align='start' className='w-auto min-w-80 gap-0 p-0'>
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={onSelectDate}
          defaultMonth={selectedDate ?? today}
          disabled={today ? { before: today } : undefined}
          locale={id}
          className='w-full'
          classNames={{ root: 'w-full' }}
        />
        <Separator />
        <div className='flex items-center justify-between gap-2 p-2.5'>
          <Button type='button' variant='ghost' size='sm' onClick={onSelectToday}>
            Hari ini
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onClearDate}
            disabled={!selectedDate}
          >
            Semua jadwal
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function BuyerHeroSearch() {
  const router = useRouter()
  const { selectedLocation, hasUpdatedLocation, locating, locationMessage, detectCurrentLocation } =
    useSelectedLocation()

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const href = buildBuyerSearchHref({
      mode,
      query,
      category,
      radiusKm,
      minStockKg,
      deadlineWindow,
      pickupDate: pickupDate ? formatPickupDateIso(pickupDate) : null,
      location: selectedLocation,
    })
    router.push(href)
  }

  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col items-center'>
      <ToggleGroup
        variant='default'
        spacing={1}
        value={[mode]}
        onValueChange={handleModeChange}
        aria-label='Mode pencarian panen'
        className='relative z-10 -mb-6 max-w-full overflow-x-auto rounded-full border border-border/80 bg-card p-1.5 shadow-md'
      >
        <ToggleGroupItem
          value='katalog'
          className='min-h-10 rounded-full px-4 text-sm font-medium text-foreground/75 hover:bg-muted hover:text-foreground aria-pressed:bg-primary/12 aria-pressed:font-semibold aria-pressed:text-primary dark:aria-pressed:bg-primary/25 dark:aria-pressed:text-primary-foreground'
        >
          <Search data-icon='inline-start' aria-hidden='true' />
          <span>Cari Panen</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value='peta'
          className='min-h-10 rounded-full px-4 text-sm font-medium text-foreground/75 hover:bg-muted hover:text-foreground aria-pressed:bg-primary/12 aria-pressed:font-semibold aria-pressed:text-primary dark:aria-pressed:bg-primary/25 dark:aria-pressed:text-primary-foreground'
        >
          <MapPin data-icon='inline-start' aria-hidden='true' />
          <span>Peta Radius</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value='segera-ditutup'
          className='min-h-10 rounded-full px-4 text-sm font-medium text-foreground/75 hover:bg-muted hover:text-foreground aria-pressed:bg-primary/12 aria-pressed:font-semibold aria-pressed:text-primary dark:aria-pressed:bg-primary/25 dark:aria-pressed:text-primary-foreground'
        >
          <Clock data-icon='inline-start' aria-hidden='true' />
          <span>Segera Ditutup</span>
        </ToggleGroupItem>
      </ToggleGroup>

      <div className='w-full rounded-2xl border border-border/80 bg-card px-4 pt-10 pb-4 text-card-foreground shadow-xl sm:px-6 sm:pt-11 sm:pb-5'>
        <form
          onSubmit={handleSubmit}
          role='search'
          aria-label='Pencarian panen surplus'
          className='grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.95fr)_minmax(0,0.95fr)_auto] lg:items-center'
        >
          <InputGroup className='min-h-12 border-input bg-background sm:col-span-2 lg:col-span-1 dark:bg-input/30'>
            <InputGroupAddon align='inline-start'>
              <Search className={controlIconClassName} aria-hidden='true' />
            </InputGroupAddon>
            <InputGroupInput
              type='search'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Cari tomat, buncis, mangga...'
              aria-label='Cari nama komoditas'
              maxLength={100}
            />
          </InputGroup>

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
          <div className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm text-foreground/75 sm:justify-start'>
            <span>
              {hasUpdatedLocation
                ? `Lokasi Anda kini diatur ke ${selectedLocation.label}`
                : `Sepertinya Anda berada di ${selectedLocation.label}. Kurang tepat?`}
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
