'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronLeft, ChevronRight, LocateFixed, MapPin } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  defaultLocation,
  findNearestLocation,
  provinceGroups,
  type HarvestRegion,
  type ProvinceGroup,
  type SelectedLocation,
} from '@/lib/data/regions'
import { cn } from '@/lib/utils'

export { defaultLocation, type SelectedLocation }

interface LocationPickerProps {
  selected: SelectedLocation
  onSelect: (location: SelectedLocation) => void
  variant?: 'banner' | 'primary' | 'secondary'
}

export function LocationPicker({ selected, onSelect, variant = 'banner' }: LocationPickerProps) {
  const [open, setOpen] = useState(false)
  const [activeProvinceId, setActiveProvinceId] = useState<string>(selected.provinceId)
  const [mobileStep, setMobileStep] = useState<'province' | 'region'>('province')
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)

  const activeProvince =
    provinceGroups.find((province) => province.id === activeProvinceId) ?? provinceGroups[0]
  const activeProvinceTotal = activeProvince.regions.reduce((sum, region) => sum + region.count, 0)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setActiveProvinceId(selected.provinceId)
      setMobileStep('province')
    }
  }

  function handleSelectProvince(provinceId: string) {
    setActiveProvinceId(provinceId)
    setMobileStep('region')
  }

  function handleSelectRegion(province: ProvinceGroup, region: HarvestRegion | null) {
    const nextLocation: SelectedLocation = region
      ? { provinceId: province.id, regionId: region.id, label: region.name }
      : { provinceId: province.id, regionId: null, label: `Semua ${province.name}` }

    onSelect(nextLocation)
    setActiveProvinceId(province.id)
    setLocationMessage(null)
    setOpen(false)
  }

  function handleDetectLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationMessage('Browser tidak mendukung deteksi lokasi.')
      return
    }

    setLocating(true)
    setLocationMessage(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = findNearestLocation(position.coords.latitude, position.coords.longitude)
        onSelect(nearest)
        setActiveProvinceId(nearest.provinceId)
        setLocating(false)
        setOpen(false)
      },
      () => {
        setLocating(false)
        setLocationMessage('Izin lokasi ditolak. Pilih wilayah secara manual.')
      },
      { timeout: 8000 }
    )
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            type='button'
            aria-label={`Pilih lokasi panen, saat ini ${selected.label}`}
            className={cn(
              'inline-flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
              variant === 'secondary' &&
                'h-7 bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-ring',
              variant === 'banner' &&
                'text-secondary-foreground hover:bg-foreground/5 focus-visible:ring-ring',
              variant === 'primary' &&
                'text-primary-foreground/95 hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:ring-primary-foreground/40'
            )}
          />
        }
      >
        <MapPin className='size-3.5 shrink-0' aria-hidden='true' />
        <span
          className={cn('truncate', variant === 'secondary' ? 'max-w-16 sm:max-w-36' : 'max-w-48')}
        >
          {selected.label}
        </span>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 transition-transform duration-150',
            open && 'rotate-180'
          )}
          aria-hidden='true'
        />
      </PopoverTrigger>

      <PopoverContent
        align={variant === 'secondary' ? 'start' : 'end'}
        sideOffset={8}
        className='w-[calc(100vw-2rem)] max-w-sm gap-0 overflow-hidden p-0 sm:w-[34rem] sm:max-w-none'
      >
        <div className='hidden grid-cols-2 border-b border-border sm:grid'>
          <div className='px-4 py-3 text-xs font-semibold text-foreground'>Provinsi</div>
          <div className='border-l border-border px-4 py-3 text-xs font-semibold text-foreground'>
            Wilayah Tani
          </div>
        </div>

        <div className='flex items-center border-b border-border px-4 py-3 sm:hidden'>
          {mobileStep === 'region' ? (
            <button
              type='button'
              onClick={() => setMobileStep('province')}
              className='inline-flex items-center gap-1.5 text-xs font-semibold text-foreground transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            >
              <ChevronLeft className='size-4 shrink-0' aria-hidden='true' />
              <span>{activeProvince.name}</span>
            </button>
          ) : (
            <span className='text-xs font-semibold text-foreground'>Pilih Provinsi</span>
          )}
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-border'>
          <ScrollArea
            className={cn('h-64 sm:h-72', mobileStep === 'region' ? 'hidden sm:block' : 'block')}
          >
            <div className='flex flex-col'>
              {provinceGroups.map((province) => {
                const isActive = province.id === activeProvince.id
                return (
                  <button
                    key={province.id}
                    type='button'
                    onClick={() => handleSelectProvince(province.id)}
                    onMouseEnter={() => setActiveProvinceId(province.id)}
                    className={cn(
                      'flex w-full items-center justify-between border-l-2 px-4 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                      isActive
                        ? 'border-primary bg-primary/10 font-medium text-primary'
                        : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <span className='truncate'>{province.name}</span>
                    <ChevronRight className='size-4 shrink-0' aria-hidden='true' />
                  </button>
                )
              })}
            </div>
          </ScrollArea>

          <ScrollArea
            className={cn('h-64 sm:h-72', mobileStep === 'province' ? 'hidden sm:block' : 'block')}
          >
            <div className='flex flex-col'>
              <button
                type='button'
                onClick={() => handleSelectRegion(activeProvince, null)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                  selected.provinceId === activeProvince.id && selected.regionId === null
                    ? 'bg-muted/70 font-medium text-primary'
                    : 'text-foreground'
                )}
              >
                <span className='truncate'>Semua {activeProvince.name}</span>
                <span className='shrink-0 text-xs tabular-nums text-muted-foreground'>
                  {activeProvinceTotal}
                </span>
              </button>

              {activeProvince.regions.map((region) => {
                const isSelected =
                  selected.provinceId === activeProvince.id && selected.regionId === region.id
                return (
                  <button
                    key={region.id}
                    type='button'
                    onClick={() => handleSelectRegion(activeProvince, region)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                      isSelected
                        ? 'bg-muted/70 font-medium text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span className='truncate'>{region.name}</span>
                    <span className='shrink-0 text-xs tabular-nums text-muted-foreground'>
                      {region.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border px-4 py-2.5'>
          <button
            type='button'
            onClick={handleDetectLocation}
            disabled={locating}
            className='inline-flex items-center gap-1.5 rounded-sm text-xs font-medium text-primary transition-opacity hover:underline underline-offset-4 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <LocateFixed className='size-3.5 shrink-0' aria-hidden='true' />
            <span>{locating ? 'Mendeteksi lokasi...' : 'Gunakan lokasi saat ini'}</span>
          </button>

          <Link
            href='/pasar'
            onClick={() => setOpen(false)}
            className='rounded-sm text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            Daftar lengkap wilayah
          </Link>
        </div>

        {locationMessage && (
          <div className='border-t border-border bg-muted/50 px-4 py-2 text-xs text-muted-foreground'>
            {locationMessage}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
