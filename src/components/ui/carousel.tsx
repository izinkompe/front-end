'use client'

import * as React from 'react'
import { cn } from 'cn'
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  prevButtonRef: React.RefObject<HTMLButtonElement | null>
  nextButtonRef: React.RefObject<HTMLButtonElement | null>
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

function isInteractiveArrowTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [role="slider"], [role="spinbutton"], [role="tab"], [role="radiogroup"], [role="toolbar"]'
    )
  )
}

function subscribeReducedMotion(onStoreChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {}
  }
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  mediaQuery.addEventListener('change', onStoreChange)
  return () => mediaQuery.removeEventListener('change', onStoreChange)
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getServerFalseSnapshot() {
  return false
}

function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & CarouselProps) {
  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerFalseSnapshot
  )

  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      duration: prefersReducedMotion ? 0 : (opts?.duration ?? 25),
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  )
  const prevButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const nextButtonRef = React.useRef<HTMLButtonElement | null>(null)

  const subscribeApi = React.useCallback(
    (onStoreChange: () => void) => {
      if (!api) return () => {}
      api.on('init', onStoreChange)
      api.on('reInit', onStoreChange)
      api.on('select', onStoreChange)
      return () => {
        api.off('init', onStoreChange)
        api.off('reInit', onStoreChange)
        api.off('select', onStoreChange)
      }
    },
    [api]
  )

  const canScrollPrev = React.useSyncExternalStore(
    subscribeApi,
    () => Boolean(api?.canScrollPrev()),
    getServerFalseSnapshot
  )

  const canScrollNext = React.useSyncExternalStore(
    subscribeApi,
    () => Boolean(api?.canScrollNext()),
    getServerFalseSnapshot
  )

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractiveArrowTarget(event.target)) return
      if (orientation === 'horizontal') {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          scrollNext()
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        scrollNext()
      }
    },
    [orientation, scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    const redirectFocusIfDisabled = (nextApi: CarouselApi) => {
      if (!nextApi) return
      const nextCanPrev = nextApi.canScrollPrev()
      const nextCanNext = nextApi.canScrollNext()
      if (!nextCanPrev && document.activeElement === prevButtonRef.current && nextCanNext) {
        nextButtonRef.current?.focus({ preventScroll: true })
      } else if (!nextCanNext && document.activeElement === nextButtonRef.current && nextCanPrev) {
        prevButtonRef.current?.focus({ preventScroll: true })
      }
    }
    api.on('reInit', redirectFocusIfDisabled)
    api.on('select', redirectFocusIfDisabled)
    return () => {
      api.off('reInit', redirectFocusIfDisabled)
      api.off('select', redirectFocusIfDisabled)
    }
  }, [api])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        prevButtonRef,
        nextButtonRef,
      }}
    >
      <div
        onKeyDown={handleKeyDown}
        className={cn('relative', className)}
        role='region'
        aria-roledescription='carousel'
        data-slot='carousel'
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className={cn(
        'overflow-hidden',
        orientation === 'horizontal' ? 'overscroll-x-contain' : 'overscroll-y-contain'
      )}
      data-slot='carousel-content'
    >
      <div
        className={cn('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<'div'>) {
  const { orientation } = useCarousel()

  return (
    <div
      role='group'
      aria-roledescription='slide'
      data-slot='carousel-item'
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev, prevButtonRef } = useCarousel()

  return (
    <Button
      ref={prevButtonRef}
      type='button'
      data-slot='carousel-previous'
      variant={variant}
      size={size}
      className={cn(
        'absolute size-11 touch-manipulation rounded-full',
        orientation === 'horizontal'
          ? 'top-1/2 -left-12 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft aria-hidden='true' />
      <span className='sr-only'>Slide sebelumnya</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext, nextButtonRef } = useCarousel()

  return (
    <Button
      ref={nextButtonRef}
      type='button'
      data-slot='carousel-next'
      variant={variant}
      size={size}
      className={cn(
        'absolute size-11 touch-manipulation rounded-full',
        orientation === 'horizontal'
          ? 'top-1/2 -right-12 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight aria-hidden='true' />
      <span className='sr-only'>Slide berikutnya</span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
}
