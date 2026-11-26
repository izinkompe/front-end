'use client'

import { LocateFixed, MapPin, RefreshCw } from 'lucide-react'
import type { BuyerRadiusOption } from '@/components/home/hero-search-params'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { catalogRadiusOptions } from '@/lib/data/catalog-params'

interface CatalogMapControlsProps {
  radiusKm: BuyerRadiusOption | null
  locating: boolean
  mapMoved: boolean
  locationMessage: string | null
  onRadiusChange: (nextRadius: BuyerRadiusOption | null) => void
  onDetectLocation: () => void
  onSearchMapCenter: () => void
}

export function CatalogMapControls({
  radiusKm,
  locating,
  mapMoved,
  locationMessage,
  onRadiusChange,
  onDetectLocation,
  onSearchMapCenter,
}: CatalogMapControlsProps) {
  const radiusValue = radiusKm ?? 'semua'
  const radiusLabel =
    catalogRadiusOptions.find((item) => item.value === radiusValue)?.label ?? 'Semua jarak'

  return (
    <>
      <div className='pointer-events-none absolute inset-x-3 top-3 z-[450] flex flex-col items-start gap-2 pr-14'>
        <div className='pointer-events-auto flex flex-wrap items-center gap-2'>
          <Select
            value={radiusValue}
            onValueChange={(value) => {
              if (!value || value === 'semua') {
                onRadiusChange(null)
                return
              }
              if (value === '5' || value === '10' || value === '25' || value === '50') {
                onRadiusChange(value as BuyerRadiusOption)
              }
            }}
          >
            <SelectTrigger
              size='sm'
              aria-label='Pilih radius peta'
              className='min-w-36 rounded-full! border-muted-foreground/45 bg-card/95 font-medium text-foreground shadow-sm backdrop-blur-xs hover:border-foreground/65'
            >
              <MapPin className='size-4 shrink-0 text-primary' aria-hidden='true' />
              <SelectValue>{radiusLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent align='start'>
              <SelectGroup>
                {catalogRadiusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={locating}
            onClick={onDetectLocation}
            className='rounded-full! border-muted-foreground/45 bg-card/95 font-medium text-foreground shadow-sm backdrop-blur-xs hover:border-foreground/65'
          >
            {locating ? (
              <Spinner data-icon='inline-start' aria-hidden='true' />
            ) : (
              <LocateFixed data-icon='inline-start' aria-hidden='true' />
            )}
            <span>{locating ? 'Mendeteksi...' : 'Lokasi saat ini'}</span>
          </Button>
        </div>

        {mapMoved && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onSearchMapCenter}
            className='pointer-events-auto rounded-full! border-muted-foreground/45 bg-card/95 font-medium text-foreground shadow-md backdrop-blur-xs hover:border-foreground/65'
          >
            <RefreshCw data-icon='inline-start' aria-hidden='true' />
            <span>Cari di area ini</span>
          </Button>
        )}
      </div>

      {locationMessage && (
        <p
          role='status'
          aria-live='polite'
          className='absolute inset-x-3 top-15 z-[450] rounded-lg border border-border bg-card/95 px-3 py-1.5 text-xs text-muted-foreground shadow-sm'
        >
          {locationMessage}
        </p>
      )}
    </>
  )
}
