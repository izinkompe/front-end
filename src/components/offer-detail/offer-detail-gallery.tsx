'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand, Images, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface OfferDetailGalleryProps {
  commodityName: string
  areaLabel: string
  photoUrls: ReadonlyArray<string>
  isUnavailable?: boolean
}

export function OfferDetailGallery({
  commodityName,
  areaLabel,
  photoUrls,
  isUnavailable = false,
}: OfferDetailGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const safeIndex = Math.min(activeIndex, Math.max(0, photoUrls.length - 1))
  const currentUrl = photoUrls[safeIndex]

  function openLightbox(index: number) {
    setActiveIndex(index)
    setLightboxOpen(true)
  }

  function handlePrev() {
    setActiveIndex((prev) => (prev === 0 ? photoUrls.length - 1 : prev - 1))
  }

  function handleNext() {
    setActiveIndex((prev) => (prev === photoUrls.length - 1 ? 0 : prev + 1))
  }

  if (photoUrls.length === 0) {
    return (
      <div
        aria-hidden='true'
        className='flex aspect-4/3 w-full items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground md:aspect-square'
      >
        <Sprout className='size-12' />
      </div>
    )
  }

  return (
    <>
      <div className='flex flex-col gap-2.5'>
        <button
          type='button'
          onClick={() => openLightbox(safeIndex)}
          aria-label={`Perbesar foto ${commodityName}`}
          className='group relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border bg-muted text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:aspect-square'
        >
          {currentUrl && (
            <Image
              src={currentUrl}
              alt={`${commodityName} dari ${areaLabel}`}
              fill
              sizes='(max-width: 767px) 100vw, (max-width: 1279px) 280px, 340px'
              loading='eager'
              fetchPriority='high'
              className={cn(
                'object-cover transition-transform duration-300 group-hover:scale-[1.02]',
                isUnavailable && 'opacity-70 grayscale-25'
              )}
            />
          )}

          <span className='absolute right-3 bottom-3 inline-flex min-h-8 items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm tabular-nums'>
            {photoUrls.length > 1 ? (
              <>
                <Images className='size-3.5' aria-hidden='true' />
                <span>
                  {safeIndex + 1}/{photoUrls.length}
                </span>
              </>
            ) : (
              <>
                <Expand className='size-3.5' aria-hidden='true' />
                <span>Perbesar</span>
              </>
            )}
          </span>
        </button>

        {photoUrls.length > 1 && (
          <div className='grid grid-cols-4 gap-2'>
            {photoUrls.map((url, idx) => (
              <button
                key={url}
                type='button'
                onClick={() => setActiveIndex(idx)}
                aria-label={`Lihat foto ${idx + 1} dari ${photoUrls.length}`}
                aria-current={idx === safeIndex ? 'true' : undefined}
                className={cn(
                  'relative aspect-square w-full overflow-hidden rounded-xl border bg-muted transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  idx === safeIndex
                    ? 'border-primary ring-2 ring-primary/40'
                    : 'border-border opacity-75 hover:opacity-100'
                )}
              >
                <Image
                  src={url}
                  alt=''
                  fill
                  sizes='84px'
                  className={cn('object-cover', isUnavailable && 'opacity-70 grayscale-25')}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <OfferLightboxDialog
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        commodityName={commodityName}
        areaLabel={areaLabel}
        photoUrls={photoUrls}
        activeIndex={safeIndex}
        onSelectIndex={setActiveIndex}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </>
  )
}

interface OfferLightboxDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commodityName: string
  areaLabel: string
  photoUrls: ReadonlyArray<string>
  activeIndex: number
  onSelectIndex: (index: number) => void
  onPrev: () => void
  onNext: () => void
}

function OfferLightboxDialog({
  open,
  onOpenChange,
  commodityName,
  areaLabel,
  photoUrls,
  activeIndex,
  onSelectIndex,
  onPrev,
  onNext,
}: OfferLightboxDialogProps) {
  const safeIndex = Math.min(activeIndex, Math.max(0, photoUrls.length - 1))
  const currentUrl = photoUrls[safeIndex]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='gap-4 p-4 sm:max-w-3xl sm:p-6'>
        <DialogHeader className='pr-10'>
          <DialogTitle className='text-base font-semibold sm:text-lg'>
            {commodityName} ({safeIndex + 1} dari {photoUrls.length})
          </DialogTitle>
        </DialogHeader>

        {currentUrl && (
          <div className='relative aspect-4/3 w-full overflow-hidden rounded-xl bg-muted'>
            <Image
              src={currentUrl}
              alt={`${commodityName} di ${areaLabel} (${safeIndex + 1} dari ${photoUrls.length})`}
              fill
              sizes='(max-width: 768px) 95vw, 760px'
              fetchPriority='low'
              className='object-contain'
            />

            {photoUrls.length > 1 && (
              <>
                <Button
                  type='button'
                  variant='secondary'
                  size='icon'
                  onClick={onPrev}
                  aria-label='Foto sebelumnya'
                  className='absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-background/90 shadow-sm hover:bg-background'
                >
                  <ChevronLeft aria-hidden='true' />
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  size='icon'
                  onClick={onNext}
                  aria-label='Foto berikutnya'
                  className='absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-background/90 shadow-sm hover:bg-background'
                >
                  <ChevronRight aria-hidden='true' />
                </Button>
              </>
            )}
          </div>
        )}

        {photoUrls.length > 1 && (
          <div className='flex flex-wrap items-center justify-center gap-2'>
            {photoUrls.map((url, idx) => (
              <button
                key={url}
                type='button'
                onClick={() => onSelectIndex(idx)}
                aria-label={`Pilih foto ${idx + 1}`}
                aria-current={idx === safeIndex ? 'true' : undefined}
                className={cn(
                  'relative size-14 overflow-hidden rounded-lg border transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  idx === safeIndex
                    ? 'border-primary ring-2 ring-primary/40'
                    : 'border-border opacity-70 hover:opacity-100'
                )}
              >
                <Image
                  src={url}
                  alt=''
                  fill
                  sizes='56px'
                  fetchPriority='low'
                  className='object-cover'
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
