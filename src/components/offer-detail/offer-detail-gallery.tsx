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
        className='flex aspect-16/9 max-h-96 w-full items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground'
      >
        <Sprout className='size-12' />
      </div>
    )
  }

  if (photoUrls.length === 1) {
    return (
      <>
        <div className='group relative aspect-16/9 max-h-112 w-full overflow-hidden rounded-2xl border border-border bg-muted'>
          <Image
            src={photoUrls[0]}
            alt={`${commodityName} dari ${areaLabel}`}
            fill
            sizes='(max-width: 1024px) 100vw, 1280px'
            loading='eager'
            fetchPriority='high'
            className={cn('object-cover', isUnavailable && 'opacity-70 grayscale-25')}
          />

          <Button
            type='button'
            variant='secondary'
            size='sm'
            onClick={() => openLightbox(0)}
            aria-label={`Perbesar foto ${commodityName}`}
            className='absolute right-3 bottom-3 rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background'
          >
            <Expand data-icon='inline-start' aria-hidden='true' />
            <span>Perbesar foto</span>
          </Button>
        </div>

        <OfferLightboxDialog
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          commodityName={commodityName}
          areaLabel={areaLabel}
          photoUrls={photoUrls}
          activeIndex={activeIndex}
          onSelectIndex={setActiveIndex}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </>
    )
  }

  const secondaryPhotos = photoUrls.slice(1, 3)

  return (
    <>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]'>
        <button
          type='button'
          onClick={() => openLightbox(0)}
          aria-label={`Lihat foto utama ${commodityName}`}
          className='relative aspect-16/10 w-full overflow-hidden rounded-2xl border border-border bg-muted text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:aspect-auto md:min-h-96'
        >
          <Image
            src={photoUrls[0]}
            alt={`${commodityName} dari ${areaLabel}`}
            fill
            sizes='(max-width: 768px) 100vw, 66vw'
            loading='eager'
            fetchPriority='high'
            className={cn('object-cover', isUnavailable && 'opacity-70 grayscale-25')}
          />

          <span className='absolute right-3 bottom-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-sm font-medium text-foreground shadow-sm tabular-nums'>
            <Images className='size-4' aria-hidden='true' />
            <span>{photoUrls.length} foto</span>
          </span>
        </button>

        <div className='grid grid-cols-2 gap-3 md:grid-cols-1'>
          {secondaryPhotos.map((url, idx) => {
            const photoIndex = idx + 1
            return (
              <button
                key={url}
                type='button'
                onClick={() => openLightbox(photoIndex)}
                aria-label={`Lihat foto ${photoIndex + 1} dari ${photoUrls.length}`}
                className='relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:min-h-46'
              >
                <Image
                  src={url}
                  alt={`${commodityName} foto ${photoIndex + 1}`}
                  fill
                  sizes='(max-width: 768px) 50vw, 33vw'
                  className={cn('object-cover', isUnavailable && 'opacity-70 grayscale-25')}
                />
              </button>
            )
          })}
        </div>
      </div>

      <OfferLightboxDialog
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        commodityName={commodityName}
        areaLabel={areaLabel}
        photoUrls={photoUrls}
        activeIndex={activeIndex}
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
