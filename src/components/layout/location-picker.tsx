'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronLeft, ChevronRight, LocateFixed, MapPin } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface HarvestRegion {
  id: string
  name: string
  count: number
  lat: number
  lng: number
}

interface ProvinceGroup {
  id: string
  name: string
  regions: HarvestRegion[]
}

const provinceGroups: ProvinceGroup[] = [
  {
    id: 'jawa-barat',
    name: 'Jawa Barat',
    regions: [
      {
        id: 'bandung-barat',
        name: 'Bandung Barat (Lembang)',
        count: 24,
        lat: -6.8167,
        lng: 107.6167,
      },
      {
        id: 'kab-bandung',
        name: 'Kab. Bandung (Pangalengan)',
        count: 19,
        lat: -7.1667,
        lng: 107.5667,
      },
      { id: 'garut', name: 'Garut', count: 16, lat: -7.2279, lng: 107.9087 },
      { id: 'cianjur', name: 'Cianjur', count: 14, lat: -6.8168, lng: 107.1425 },
      { id: 'bogor', name: 'Bogor', count: 12, lat: -6.5971, lng: 106.806 },
      { id: 'subang', name: 'Subang', count: 11, lat: -6.5715, lng: 107.7587 },
      { id: 'sukabumi', name: 'Sukabumi', count: 9, lat: -6.9277, lng: 106.93 },
      { id: 'majalengka', name: 'Majalengka', count: 7, lat: -6.8364, lng: 108.2275 },
    ],
  },
  {
    id: 'jawa-tengah',
    name: 'Jawa Tengah',
    regions: [
      { id: 'magelang', name: 'Magelang', count: 18, lat: -7.4797, lng: 110.2177 },
      { id: 'wonosobo', name: 'Wonosobo', count: 15, lat: -7.3632, lng: 109.9002 },
      { id: 'boyolali', name: 'Boyolali', count: 13, lat: -7.5311, lng: 110.5955 },
      { id: 'brebes', name: 'Brebes', count: 12, lat: -6.8706, lng: 109.0422 },
      { id: 'semarang', name: 'Kab. Semarang', count: 10, lat: -7.1369, lng: 110.4034 },
      { id: 'temanggung', name: 'Temanggung', count: 8, lat: -7.3167, lng: 110.175 },
    ],
  },
  {
    id: 'jawa-timur',
    name: 'Jawa Timur',
    regions: [
      { id: 'malang-batu', name: 'Malang & Batu', count: 26, lat: -7.8712, lng: 112.5269 },
      { id: 'pasuruan', name: 'Pasuruan', count: 14, lat: -7.6453, lng: 112.9075 },
      { id: 'jember', name: 'Jember', count: 13, lat: -8.1724, lng: 113.7007 },
      { id: 'kediri', name: 'Kediri', count: 11, lat: -7.848, lng: 112.0178 },
      { id: 'banyuwangi', name: 'Banyuwangi', count: 10, lat: -8.2192, lng: 114.3691 },
      { id: 'blitar', name: 'Blitar', count: 9, lat: -8.0955, lng: 112.1609 },
    ],
  },
  {
    id: 'di-yogyakarta',
    name: 'DI Yogyakarta',
    regions: [
      { id: 'sleman', name: 'Sleman', count: 15, lat: -7.716, lng: 110.3556 },
      { id: 'bantul', name: 'Bantul', count: 11, lat: -7.8881, lng: 110.3288 },
      { id: 'kulon-progo', name: 'Kulon Progo', count: 9, lat: -7.8267, lng: 110.1641 },
      { id: 'gunungkidul', name: 'Gunungkidul', count: 7, lat: -7.9949, lng: 110.6025 },
    ],
  },
  {
    id: 'banten',
    name: 'Banten',
    regions: [
      { id: 'tangerang', name: 'Kab. Tangerang', count: 10, lat: -6.2024, lng: 106.5193 },
      { id: 'serang', name: 'Serang', count: 8, lat: -6.12, lng: 106.1503 },
      { id: 'pandeglang', name: 'Pandeglang', count: 7, lat: -6.3084, lng: 106.1066 },
      { id: 'lebak', name: 'Lebak', count: 6, lat: -6.5644, lng: 106.2522 },
    ],
  },
  {
    id: 'bali',
    name: 'Bali',
    regions: [
      { id: 'tabanan', name: 'Tabanan', count: 17, lat: -8.5413, lng: 115.1252 },
      { id: 'bangli', name: 'Bangli (Kintamani)', count: 14, lat: -8.2422, lng: 115.3292 },
      { id: 'gianyar', name: 'Gianyar', count: 11, lat: -8.5449, lng: 115.3255 },
      { id: 'buleleng', name: 'Buleleng', count: 9, lat: -8.112, lng: 115.0882 },
    ],
  },
  {
    id: 'sumatera-utara',
    name: 'Sumatera Utara',
    regions: [
      { id: 'karo', name: 'Karo (Berastagi)', count: 21, lat: 3.1853, lng: 98.5049 },
      { id: 'simalungun', name: 'Simalungun', count: 12, lat: 2.9025, lng: 98.8986 },
      { id: 'deli-serdang', name: 'Deli Serdang', count: 10, lat: 3.4214, lng: 98.7042 },
    ],
  },
  {
    id: 'sulawesi-selatan',
    name: 'Sulawesi Selatan',
    regions: [
      { id: 'gowa', name: 'Gowa', count: 14, lat: -5.3167, lng: 119.75 },
      { id: 'enrekang', name: 'Enrekang', count: 12, lat: -3.5625, lng: 119.7764 },
      { id: 'bantaeng', name: 'Bantaeng', count: 8, lat: -5.5458, lng: 119.9469 },
    ],
  },
]

export interface SelectedLocation {
  provinceId: string
  regionId: string | null
  label: string
}

export const defaultLocation: SelectedLocation = {
  provinceId: 'jawa-barat',
  regionId: 'bandung-barat',
  label: 'Bandung Barat (Lembang)',
}

interface LocationPickerProps {
  selected: SelectedLocation
  onSelect: (location: SelectedLocation) => void
  variant?: 'banner' | 'primary' | 'secondary'
}

function findNearestLocation(lat: number, lng: number): SelectedLocation {
  let nearestProvince = provinceGroups[0]
  let nearestRegion = provinceGroups[0].regions[0]
  let minDistanceSq = Number.POSITIVE_INFINITY

  for (const province of provinceGroups) {
    for (const region of province.regions) {
      const dLat = region.lat - lat
      const dLng = region.lng - lng
      const distanceSq = dLat * dLat + dLng * dLng
      if (distanceSq < minDistanceSq) {
        minDistanceSq = distanceSq
        nearestProvince = province
        nearestRegion = region
      }
    }
  }

  return {
    provinceId: nearestProvince.id,
    regionId: nearestRegion.id,
    label: nearestRegion.name,
  }
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
