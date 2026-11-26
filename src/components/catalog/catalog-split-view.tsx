'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Map as MapIcon, MapPin, RefreshCw, X } from 'lucide-react'
import type { ShareButtonState } from '@/components/home/buyer-expiring-offer-card'
import type { BuyerRadiusOption } from '@/components/home/hero-search-params'
import type { Coordinates } from '@/components/home/offer-card-helpers'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { CatalogOfferItem, CatalogViewMode } from '@/lib/data/catalog-filters'
import { cn } from '@/lib/utils'
import type { Offer } from '@/types/api/offers'
import { CatalogOfferCard } from './catalog-offer-card'
import { CatalogRadiusMap } from './catalog-radius-map'

interface CatalogSplitViewProps {
  leftControls: ReactNode
  listBodyFallback?: ReactNode
  loadMoreSlot?: ReactNode
  cardLayout: CatalogViewMode
  visibleItems: ReadonlyArray<CatalogOfferItem>
  mapItems: ReadonlyArray<CatalogOfferItem>
  nowMs: number | null
  referenceCoordinates: Coordinates | null
  radiusKm: BuyerRadiusOption | null
  mapError: string | null
  favoriteIds: Set<string>
  shareStates: Record<string, ShareButtonState>
  onRadiusChange: (nextRadius: BuyerRadiusOption | null) => void
  onEnsureOfferVisible: (offerId: string) => void
  onToggleFavorite: (offer: Offer) => void
  onShare: (offer: Offer) => void
  onMapFailure: (reason: string) => void
  onRetryMap: () => void
}

export function CatalogSplitView({
  leftControls,
  listBodyFallback,
  loadMoreSlot,
  cardLayout,
  visibleItems,
  mapItems,
  nowMs,
  referenceCoordinates,
  radiusKm,
  mapError,
  favoriteIds,
  shareStates,
  onRadiusChange,
  onEnsureOfferVisible,
  onToggleFavorite,
  onShare,
  onMapFailure,
  onRetryMap,
}: CatalogSplitViewProps) {
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null)
  const [hoveredOfferId, setHoveredOfferId] = useState<string | null>(null)
  const [mobileMapOpen, setMobileMapOpen] = useState(false)
  const cardNodesRef = useRef<Map<string, HTMLDivElement>>(new Map())

  const handleSelectOfferFromMap = useCallback(
    (offerId: string | null) => {
      setSelectedOfferId(offerId)
      if (!offerId) return
      onEnsureOfferVisible(offerId)
      requestAnimationFrame(() => {
        const targetNode = cardNodesRef.current.get(offerId)
        if (targetNode) {
          targetNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      })
    },
    [onEnsureOfferVisible]
  )

  const hasMap = !mapError
  const isGridCards = cardLayout === 'grid'

  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 lg:items-start',
        hasMap
          ? 'lg:grid-cols-[minmax(0,1fr)_minmax(340px,38%)] xl:grid-cols-[minmax(0,1fr)_minmax(380px,36%)]'
          : 'mx-auto max-w-[1600px]'
      )}
    >
      <div
        className={cn(
          'flex min-w-0 flex-col gap-3.5 px-4 py-3 sm:gap-4 sm:px-6 sm:py-5 lg:py-6',
          hasMap ? 'lg:pr-6 lg:pl-8' : 'lg:px-8'
        )}
      >
        {leftControls}

        {mapError && (
          <Alert className='border-border bg-muted/50 text-foreground'>
            <MapPin aria-hidden='true' />
            <AlertTitle>Peta tidak dapat dimuat</AlertTitle>
            <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <span>{mapError}</span>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={onRetryMap}
                className='w-fit bg-card'
              >
                <RefreshCw data-icon='inline-start' aria-hidden='true' />
                Coba muat peta
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {hasMap && (
          <div className='flex items-center justify-between gap-2 lg:hidden'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setMobileMapOpen(true)}
              className='min-h-11 w-full bg-card'
            >
              <MapIcon data-icon='inline-start' aria-hidden='true' />
              <span>
                Buka peta radius ({mapItems.length}
                {radiusKm ? ` • ${radiusKm} km` : ''})
              </span>
            </Button>
          </div>
        )}

        <Dialog open={hasMap && mobileMapOpen} onOpenChange={setMobileMapOpen}>
          <DialogContent
            showCloseButton={false}
            className='fixed inset-0 top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-background p-0 lg:hidden'
          >
            <div className='flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-3'>
              <div className='min-w-0'>
                <DialogTitle className='text-base font-bold text-foreground'>
                  Peta radius panen
                </DialogTitle>
                <DialogDescription className='truncate text-xs text-muted-foreground tabular-nums'>
                  {mapItems.length} penawaran tersedia • pilih pin atau atur radius
                </DialogDescription>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setMobileMapOpen(false)}
                aria-label='Tutup peta radius'
                className='shrink-0'
              >
                <X aria-hidden='true' />
              </Button>
            </div>

            <div className='relative min-h-0 flex-1'>
              <CatalogRadiusMap
                items={mapItems}
                referenceCoordinates={referenceCoordinates}
                radiusKm={radiusKm}
                selectedOfferId={selectedOfferId}
                hoveredOfferId={hoveredOfferId}
                fullBleed
                onRadiusChange={onRadiusChange}
                onSelectOffer={handleSelectOfferFromMap}
                onHoverOffer={setHoveredOfferId}
                onMapFailure={(reason) => {
                  setMobileMapOpen(false)
                  onMapFailure(reason)
                }}
              />
            </div>

            <div className='flex items-center justify-between gap-2 border-t border-border bg-background px-4 py-3'>
              <p className='text-xs text-muted-foreground'>
                {selectedOfferId
                  ? 'Penawaran dipilih. Lihat di daftar atau buka detailnya.'
                  : 'Ketuk pin atau klaster pada peta untuk memilih panen.'}
              </p>
              <Button
                type='button'
                size='sm'
                onClick={() => {
                  const targetId = selectedOfferId
                  setMobileMapOpen(false)
                  if (targetId) {
                    handleSelectOfferFromMap(targetId)
                  }
                }}
                className='shrink-0'
              >
                {selectedOfferId ? 'Lihat di daftar' : 'Selesai'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {listBodyFallback ? (
          listBodyFallback
        ) : (
          <div className='flex flex-col gap-4'>
            <div
              className={cn(
                isGridCards
                  ? hasMap
                    ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'flex flex-col gap-3.5'
              )}
            >
              {visibleItems.map((item, index) => {
                const isSelected = selectedOfferId === item.offer.id
                return (
                  <div
                    key={item.offer.id}
                    ref={(node) => {
                      if (node) {
                        cardNodesRef.current.set(item.offer.id, node)
                      } else {
                        cardNodesRef.current.delete(item.offer.id)
                      }
                    }}
                    onMouseEnter={() => setHoveredOfferId(item.offer.id)}
                    onMouseLeave={() => setHoveredOfferId(null)}
                    onFocus={() => setHoveredOfferId(item.offer.id)}
                    onBlur={() => setHoveredOfferId(null)}
                    className={cn(
                      'catalog-containment rounded-2xl transition-shadow',
                      isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    )}
                  >
                    <CatalogOfferCard
                      offer={item.offer}
                      distanceKm={item.distanceKm}
                      nowMs={nowMs}
                      priorityImage={index < 2}
                      isFavorite={favoriteIds.has(item.offer.id)}
                      shareState={shareStates[item.offer.id] ?? 'idle'}
                      layout={isGridCards ? 'grid' : 'row'}
                      onToggleFavorite={onToggleFavorite}
                      onShare={onShare}
                    />
                  </div>
                )
              })}
            </div>

            {loadMoreSlot}
          </div>
        )}

        <p className='max-w-[74ch] pt-1 text-sm leading-relaxed text-muted-foreground'>
          Semua penawaran memakai sistem ambil mandiri dalam satuan kilogram. Alamat lengkap titik
          pengambilan terbuka setelah pesanan dibuat, dan jarak diukur sebagai garis lurus dari
          lokasi acuan.
        </p>
      </div>

      {hasMap && (
        <aside
          aria-label='Peta radius penawaran panen'
          className='hidden lg:sticky lg:top-[6.875rem] lg:block lg:h-[calc(100dvh-6.875rem)]'
        >
          <CatalogRadiusMap
            items={mapItems}
            referenceCoordinates={referenceCoordinates}
            radiusKm={radiusKm}
            selectedOfferId={selectedOfferId}
            hoveredOfferId={hoveredOfferId}
            fullBleed
            onRadiusChange={onRadiusChange}
            onSelectOffer={handleSelectOfferFromMap}
            onHoverOffer={setHoveredOfferId}
            onMapFailure={onMapFailure}
          />
        </aside>
      )}
    </div>
  )
}
