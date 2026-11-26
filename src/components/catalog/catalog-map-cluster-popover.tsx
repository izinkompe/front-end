'use client'

import { MapPin, X } from 'lucide-react'
import {
  formatPricePerKg,
  formatWeightKg,
  getCommodityConditionMeta,
} from '@/components/home/offer-card-helpers'
import { Button } from '@/components/ui/button'
import type { CatalogMapCluster, ClusterPopupPlacement } from '@/lib/data/catalog-map-helpers'
import { cn } from '@/lib/utils'

interface CatalogMapClusterPopoverProps {
  cluster: CatalogMapCluster
  placement: ClusterPopupPlacement
  selectedOfferId: string | null
  onPickOffer: (offerId: string) => void
  onHoverOffer: (offerId: string | null) => void
  onClose: () => void
  onPointerEnter: () => void
  onPointerLeave: () => void
}

export function CatalogMapClusterPopover({
  cluster,
  placement,
  selectedOfferId,
  onPickOffer,
  onHoverOffer,
  onClose,
  onPointerEnter,
  onPointerLeave,
}: CatalogMapClusterPopoverProps) {
  return (
    <section
      aria-label={`Daftar ${cluster.items.length} penawaran di ${cluster.primaryArea}`}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      style={{
        left: `${placement.left}px`,
        top: placement.top !== null ? `${placement.top}px` : undefined,
        bottom: placement.bottom !== null ? `${placement.bottom}px` : undefined,
        width: `${placement.width}px`,
        transformOrigin: placement.openAbove ? 'bottom center' : 'top center',
      }}
      className='animate-in fade-in-0 zoom-in-95 absolute z-[460] flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl ring-1 ring-foreground/10 duration-150 motion-reduce:animate-none'
    >
      <header className='flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2'>
        <div className='flex min-w-0 items-center gap-1.5'>
          <MapPin className='size-3.5 shrink-0 text-primary' aria-hidden='true' />
          <p className='truncate text-sm font-semibold text-foreground'>{cluster.primaryArea}</p>
          <span className='shrink-0 rounded-full bg-primary/12 px-1.5 py-0.5 text-xs font-semibold text-primary tabular-nums'>
            {cluster.items.length} panen
          </span>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='icon-xs'
          onClick={onClose}
          aria-label='Tutup daftar penawaran peta'
          className='shrink-0 text-muted-foreground hover:text-foreground'
        >
          <X aria-hidden='true' />
        </Button>
      </header>

      <ul
        style={{ maxHeight: `${placement.maxHeight}px` }}
        className='divide-y divide-border overflow-y-auto overscroll-contain p-1.5'
      >
        {cluster.items.map((item) => {
          const isSelected = item.offer.id === selectedOfferId
          const conditionMeta = getCommodityConditionMeta(item.offer.condition)

          return (
            <li key={item.offer.id} className='py-0.5 first:pt-0 last:pb-0'>
              <button
                type='button'
                onClick={() => onPickOffer(item.offer.id)}
                onMouseEnter={() => onHoverOffer(item.offer.id)}
                onMouseLeave={() => onHoverOffer(null)}
                onFocus={() => onHoverOffer(item.offer.id)}
                onBlur={() => onHoverOffer(null)}
                className={cn(
                  'group flex w-full flex-col gap-1 rounded-lg px-2.5 py-2 text-left transition-colors outline-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.99]',
                  isSelected && 'bg-primary/8 ring-1 ring-primary/35'
                )}
              >
                <div className='flex items-start justify-between gap-2'>
                  <span className='line-clamp-1 text-sm font-semibold text-foreground underline-offset-4 group-hover:underline'>
                    {item.offer.commodityName}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 text-xs font-bold tabular-nums',
                      item.isExpired ? 'text-muted-foreground' : 'text-primary'
                    )}
                  >
                    {formatPricePerKg(item.offer.pricePerKg)}
                  </span>
                </div>

                <div className='flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
                  <span>
                    Sisa {formatWeightKg(item.offer.availableStockKg)} · {conditionMeta.label}
                  </span>
                  {isSelected && <span className='font-semibold text-primary'>Dipilih</span>}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
