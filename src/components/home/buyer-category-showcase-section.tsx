'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useSelectedLocation } from '@/components/providers/location-provider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useOffers } from '@/hooks/api/use-offers'
import {
  buildCategoryCatalogHref,
  filterAndSortCategoryOffers,
  getCategoryMeta,
  mainCategories,
  summarizeCategoryOffers,
  type BuyerCategorySlug,
  type MainCategoryMeta,
} from '@/lib/data/categories'
import type { SelectedLocation } from '@/lib/data/regions'
import type { Offer } from '@/types/api/offers'
import { BuyerCategoryProductCard } from './buyer-category-product-card'
import {
  calculateStraightLineDistanceKm,
  formatPricePerKg,
  formatWeightKg,
  getLocationCoordinates,
  type Coordinates,
} from './offer-card-helpers'

const MAX_FEATURED_PRODUCTS = 3

function isBuyerCategorySlug(value: string | undefined): value is BuyerCategorySlug {
  return value === 'sayuran' || value === 'buah' || value === 'padi-biji' || value === 'rempah-umbi'
}

function CategoryShowcaseSkeleton() {
  return (
    <div
      role='status'
      aria-label='Memuat etalase komoditas berdasarkan kategori'
      className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
    >
      <div className='flex h-full flex-col justify-between gap-4 rounded-2xl border border-border bg-muted/50 p-5'>
        <div className='flex flex-col gap-3'>
          <div className='flex items-center justify-between gap-2'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-6 w-24 rounded-full' />
          </div>
          <Skeleton className='h-4 w-4/5' />
        </div>
        <div className='flex flex-col gap-2.5'>
          <Skeleton className='h-12 w-full rounded-lg' />
          <Skeleton className='h-10 w-full rounded-lg' />
        </div>
      </div>

      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className='flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card'
        >
          <Skeleton className='aspect-4/3 w-full rounded-none' />
          <div className='flex flex-1 flex-col justify-between gap-4 p-4'>
            <div className='flex flex-col gap-2.5'>
              <div className='flex items-center justify-between gap-2'>
                <Skeleton className='h-6 w-24 rounded-lg' />
                <Skeleton className='h-4 w-16' />
              </div>
              <Skeleton className='h-4 w-36' />
              <Skeleton className='h-5 w-4/5' />
              <div className='flex items-end justify-between gap-2 pt-1'>
                <Skeleton className='h-8 w-24' />
                <Skeleton className='h-6 w-28' />
              </div>
            </div>
            <Skeleton className='h-4 w-full' />
          </div>
        </div>
      ))}
    </div>
  )
}

interface CategorySummaryCardProps {
  category: MainCategoryMeta
  offers: ReadonlyArray<Offer>
  location: SelectedLocation
}

function CategorySummaryCard({ category, offers, location }: CategorySummaryCardProps) {
  const summary = summarizeCategoryOffers(offers)
  const categoryHref = buildCategoryCatalogHref(category.slug, location)

  const priceRangeLabel =
    summary.minPricePerKg !== null && summary.maxPricePerKg !== null
      ? summary.minPricePerKg === summary.maxPricePerKg
        ? formatPricePerKg(summary.minPricePerKg)
        : `${formatPricePerKg(summary.minPricePerKg)} s.d. ${formatPricePerKg(summary.maxPricePerKg)}`
      : 'Belum tersedia'

  const areasLabel =
    summary.uniqueAreas.length > 0 ? summary.uniqueAreas.slice(0, 3).join(', ') : 'Menunggu panen'

  return (
    <Card className='h-full justify-between rounded-2xl border border-border bg-muted/50 ring-0'>
      <CardHeader className='gap-2'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <CardTitle>
            <h3 className='text-lg leading-snug font-bold text-foreground'>{category.label}</h3>
          </CardTitle>
          <Badge variant='outline' className='bg-card text-sm tabular-nums'>
            {summary.activeCount} penawaran
          </Badge>
        </div>
        <p className='text-sm leading-relaxed text-muted-foreground'>{category.examples}</p>
      </CardHeader>

      <CardContent className='flex flex-col gap-3'>
        <Separator />
        <dl className='flex flex-col gap-3 text-sm'>
          <div className='flex items-baseline justify-between gap-2'>
            <dt className='text-muted-foreground'>Stok siap ambil</dt>
            <dd className='font-semibold text-foreground tabular-nums'>
              {formatWeightKg(summary.totalAvailableStockKg)}
            </dd>
          </div>
          <div className='flex items-baseline justify-between gap-2'>
            <dt className='text-muted-foreground'>Kisaran harga</dt>
            <dd className='text-right font-semibold text-primary tabular-nums'>
              {priceRangeLabel}
            </dd>
          </div>
          <div className='flex flex-col gap-1'>
            <dt className='text-muted-foreground'>Sentra panen aktif</dt>
            <dd className='line-clamp-2 text-sm leading-relaxed font-medium text-foreground'>
              {areasLabel}
            </dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className='border-t-0 bg-transparent pt-0'>
        <Button
          variant='default'
          className='w-full'
          nativeButton={false}
          render={<Link href={categoryHref} />}
        >
          Lihat semua {category.shortLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}

function getOfferDistance(offer: Offer, referenceCoordinates: Coordinates | null): number | null {
  if (
    !referenceCoordinates ||
    typeof offer.latitude !== 'number' ||
    typeof offer.longitude !== 'number'
  ) {
    return null
  }
  return calculateStraightLineDistanceKm(referenceCoordinates, {
    lat: offer.latitude,
    lng: offer.longitude,
  })
}

export function BuyerCategoryShowcaseSection() {
  const { selectedLocation } = useSelectedLocation()
  const { data: offers, isPending, isError, refetch } = useOffers()
  const [activeCategory, setActiveCategory] = useState<BuyerCategorySlug>('sayuran')

  const referenceCoordinates = useMemo(
    () => getLocationCoordinates(selectedLocation),
    [selectedLocation]
  )

  const offersByCategory = useMemo(() => {
    const items = offers ?? []
    const grouped = {} as Record<BuyerCategorySlug, Offer[]>
    for (const category of mainCategories) {
      grouped[category.slug] = filterAndSortCategoryOffers(
        items,
        category.slug,
        referenceCoordinates
      )
    }
    return grouped
  }, [offers, referenceCoordinates])

  function handleCategoryChange(nextValues: string[]) {
    const next = nextValues[0]
    if (isBuyerCategorySlug(next)) {
      setActiveCategory(next)
    }
  }

  const activeCategoryMeta = getCategoryMeta(activeCategory)
  const activeOffers = offersByCategory[activeCategory]
  const featuredOffers = activeOffers.slice(0, MAX_FEATURED_PRODUCTS)

  return (
    <section className='w-full bg-background text-foreground'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-12 sm:px-6 sm:py-14 lg:px-8'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div className='flex flex-col gap-1.5'>
              <h2
                id='category-showcase-heading'
                className='text-[clamp(1.5rem,1.25rem+0.9vw,2rem)] leading-tight font-bold text-foreground'
              >
                Panen per kategori
              </h2>
              <p className='max-w-[62ch] text-base leading-relaxed text-muted-foreground'>
                Terdekat dari {selectedLocation.label}.
              </p>
            </div>

            <Link
              href='/pasar'
              className='inline-flex min-h-10 w-fit items-center rounded-md px-2 py-1.5 text-base font-semibold text-primary transition-opacity pointer-coarse:min-h-11 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
            >
              Buka katalog lengkap
            </Link>
          </div>

          <ToggleGroup
            variant='default'
            spacing={2}
            value={[activeCategory]}
            onValueChange={handleCategoryChange}
            aria-label='Pilih kategori komoditas utama'
            className='flex max-w-full flex-wrap items-center gap-2'
          >
            {mainCategories.map((category) => (
              <ToggleGroupItem
                key={category.slug}
                value={category.slug}
                className='min-h-10 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors pointer-coarse:min-h-11 hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:font-semibold aria-pressed:text-primary-foreground'
              >
                {category.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {isPending ? (
          <CategoryShowcaseSkeleton />
        ) : isError ? (
          <Alert className='border-border bg-card text-card-foreground'>
            <AlertCircle aria-hidden='true' />
            <AlertTitle>Gagal memuat katalog</AlertTitle>
            <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <span>Muat ulang untuk melihat penawaran {activeCategoryMeta.label}.</span>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => refetch()}
                className='w-fit'
              >
                <RefreshCw data-icon='inline-start' aria-hidden='true' />
                Muat ulang
              </Button>
            </AlertDescription>
          </Alert>
        ) : activeOffers.length === 0 ? (
          <div className='flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-muted/50 p-6 text-foreground sm:flex-row sm:items-center'>
            <div className='flex flex-col gap-1'>
              <h3 className='text-lg leading-snug font-semibold text-foreground'>
                Belum ada penawaran {activeCategoryMeta.label}
              </h3>
              <p className='max-w-[60ch] text-base leading-relaxed text-muted-foreground'>
                Pilih kategori lain atau pasang permintaan di Papan Kebutuhan Pangan.
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              nativeButton={false}
              render={<Link href='/papan-kebutuhan' />}
            >
              Pasang kebutuhan pangan
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <CategorySummaryCard
              category={activeCategoryMeta}
              offers={activeOffers}
              location={selectedLocation}
            />
            {featuredOffers.map((offer) => (
              <BuyerCategoryProductCard
                key={offer.id}
                offer={offer}
                distanceKm={getOfferDistance(offer, referenceCoordinates)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
