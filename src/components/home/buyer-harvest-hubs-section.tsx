'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useSelectedLocation } from '@/components/providers/location-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { buildProvinceMapHref, getNearbyHarvestHubs } from './home-discovery-helpers'
import { formatStraightLineDistance } from './offer-card-helpers'

export function BuyerHarvestHubsSection() {
  const { selectedLocation, setSelectedLocation } = useSelectedLocation()

  const nearbyHubs = useMemo(() => getNearbyHarvestHubs(selectedLocation, 6), [selectedLocation])
  const provinceMapHref = buildProvinceMapHref(selectedLocation)

  return (
    <section className='w-full bg-muted/50 text-foreground'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-14 lg:px-8'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div className='flex flex-col gap-1.5'>
            <h2 id='harvest-hubs-heading' className='type-h2 text-foreground'>
              Sentra panen terdekat
            </h2>
            <p className='max-w-[62ch] text-base leading-relaxed text-muted-foreground'>
              Jarak garis lurus dari {selectedLocation.label}.
            </p>
          </div>

          <Button
            variant='outline'
            size='sm'
            className='w-fit bg-card'
            nativeButton={false}
            render={<Link href={provinceMapHref} />}
          >
            Buka peta radius
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {nearbyHubs.map((hub) => {
            const distanceLabel =
              hub.isSelectedLocation || hub.distanceKm === 0
                ? 'Lokasi acuan'
                : hub.distanceKm !== null
                  ? formatStraightLineDistance(hub.distanceKm)
                  : null

            return (
              <article
                key={`${hub.provinceId}-${hub.id}`}
                className={cn(
                  'relative flex h-full flex-col justify-between gap-4 rounded-2xl border bg-card p-5 text-card-foreground shadow-sm transition-shadow has-[a.hub-card-link:hover]:border-foreground/30 has-[a.hub-card-link:hover]:shadow-md has-[a.hub-card-link:focus-visible]:outline-2 has-[a.hub-card-link:focus-visible]:outline-offset-2 has-[a.hub-card-link:focus-visible]:outline-ring',
                  hub.isSelectedLocation ? 'border-primary' : 'border-border'
                )}
              >
                <div className='flex flex-col gap-2.5'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-medium text-muted-foreground'>
                        {hub.provinceName}
                      </p>
                      <h3 className='mt-0.5 text-lg leading-snug font-bold text-foreground'>
                        <Link
                          href={hub.href}
                          className='hub-card-link underline-offset-4 outline-none hover:underline after:absolute after:inset-0 after:content-[""]'
                        >
                          {hub.name}
                        </Link>
                      </h3>
                    </div>

                    {distanceLabel && (
                      <Badge
                        variant={hub.isSelectedLocation ? 'default' : 'secondary'}
                        className='shrink-0 rounded-lg px-2.5 py-0.5 text-sm tabular-nums'
                      >
                        {distanceLabel}
                      </Badge>
                    )}
                  </div>

                  <p className='text-sm leading-relaxed text-muted-foreground'>{hub.highlights}</p>
                </div>

                <div className='flex flex-col gap-3'>
                  <Separator />
                  <footer className='flex flex-wrap items-center justify-between gap-2'>
                    <span className='text-sm font-semibold text-foreground tabular-nums'>
                      {hub.count} penawaran aktif
                    </span>

                    {!hub.isSelectedLocation && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        aria-label={`Jadikan lokasi acuan ${hub.name}`}
                        onClick={() =>
                          setSelectedLocation({
                            provinceId: hub.provinceId,
                            regionId: hub.id,
                            label: hub.name,
                          })
                        }
                        className='relative z-1 min-h-10 px-3 py-1.5 text-sm text-primary pointer-coarse:min-h-11 hover:text-primary'
                      >
                        Jadikan lokasi acuan
                      </Button>
                    )}
                  </footer>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
