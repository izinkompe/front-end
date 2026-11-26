'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Search, Sprout, Store, X } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import type { Offer } from '@/types/api/offers'
import {
  getHeroSearchSuggestions,
  splitHighlightSegments,
  type CommoditySuggestion,
  type OfferSuggestion,
} from './hero-search-suggestions'

interface HeroSearchComboboxProps {
  query: string
  onQueryChange: (nextQuery: string) => void
  offers: ReadonlyArray<Offer>
  onSubmitQuery: (nextQuery: string) => void
  onSelectCommodity: (commodity: CommoditySuggestion) => void
  onSelectOffer: (offer: OfferSuggestion) => void
  className?: string
}

type FlatSuggestionAction =
  | { key: string; kind: 'search'; query: string }
  | { key: string; kind: 'commodity'; item: CommoditySuggestion }
  | { key: string; kind: 'offer'; item: OfferSuggestion }

function HighlightedText({ text, query }: { text: string; query: string }) {
  const segments = splitHighlightSegments(text, query)
  return (
    <>
      {segments.map((segment, index) =>
        segment.matched ? (
          <strong key={`${index}-${segment.text}`} className='font-semibold text-foreground'>
            {segment.text}
          </strong>
        ) : (
          <span key={`${index}-${segment.text}`}>{segment.text}</span>
        )
      )}
    </>
  )
}

export function HeroSearchCombobox({
  query,
  onQueryChange,
  offers,
  onSubmitQuery,
  onSelectCommodity,
  onSelectOffer,
  className = 'sm:col-span-2 lg:col-span-1',
}: HeroSearchComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const suggestions = useMemo(() => getHeroSearchSuggestions(query, offers), [query, offers])
  const trimmedQuery = suggestions.normalizedQuery
  const isOpen = open && trimmedQuery.length > 0

  const flatActions = useMemo<FlatSuggestionAction[]>(() => {
    if (!trimmedQuery) return []
    const items: FlatSuggestionAction[] = [
      { key: 'search-current', kind: 'search', query: trimmedQuery },
    ]
    for (const commodity of suggestions.commodities) {
      items.push({ key: commodity.id, kind: 'commodity', item: commodity })
    }
    for (const offer of suggestions.offers) {
      items.push({ key: `offer-${offer.id}`, kind: 'offer', item: offer })
    }
    return items
  }, [trimmedQuery, suggestions.commodities, suggestions.offers])

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen])

  function runAction(action: FlatSuggestionAction) {
    setOpen(false)
    setActiveIndex(-1)
    if (action.kind === 'search') {
      onSubmitQuery(action.query)
      return
    }
    if (action.kind === 'commodity') {
      onSelectCommodity(action.item)
      return
    }
    onSelectOffer(action.item)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || flatActions.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % flatActions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? flatActions.length - 1 : prev - 1))
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
      return
    }

    if (event.key === 'Enter' && activeIndex >= 0 && activeIndex < flatActions.length) {
      event.preventDefault()
      runAction(flatActions[activeIndex])
    }
  }

  const activeOptionId =
    isOpen && activeIndex >= 0 && activeIndex < flatActions.length
      ? `${listboxId}-option-${activeIndex}`
      : undefined

  const commodityStartIndex = 1
  const offerStartIndex = 1 + suggestions.commodities.length

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <InputGroup
        className={cn(
          'min-h-12 border-input bg-background text-foreground dark:bg-input/30',
          isOpen && 'rounded-b-none border-b-transparent'
        )}
      >
        <InputGroupAddon align='inline-start'>
          <Search className='size-4 shrink-0 text-muted-foreground' aria-hidden='true' />
        </InputGroupAddon>
        <InputGroupInput
          type='search'
          role='combobox'
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-autocomplete='list'
          aria-activedescendant={activeOptionId}
          aria-label='Cari nama komoditas'
          value={query}
          onFocus={() => {
            if (query.trim().length > 0) {
              setOpen(true)
            }
          }}
          onChange={(event) => {
            const nextValue = event.target.value
            onQueryChange(nextValue)
            setOpen(nextValue.trim().length > 0)
            setActiveIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          placeholder='Cari tomat, buncis, mangga...'
          maxLength={100}
          autoComplete='off'
          className='text-foreground placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden'
        />
        {query.length > 0 && (
          <InputGroupAddon align='inline-end' className='pr-3'>
            <button
              type='button'
              onClick={() => {
                onQueryChange('')
                setOpen(false)
                setActiveIndex(-1)
              }}
              aria-label='Hapus kata kunci pencarian'
              className='inline-flex items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
            >
              <X className='size-4 shrink-0' aria-hidden='true' />
            </button>
          </InputGroupAddon>
        )}
      </InputGroup>

      {isOpen && (
        <div
          id={listboxId}
          role='listbox'
          aria-label='Saran jenis komoditas dan penawaran PanganTani'
          className='absolute inset-x-0 top-full z-50 overflow-hidden rounded-b-lg border border-t-0 border-input bg-popover text-left text-popover-foreground shadow-xl'
        >
          <button
            id={`${listboxId}-option-0`}
            type='button'
            role='option'
            aria-selected={activeIndex === 0}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActiveIndex(0)}
            onClick={() => runAction(flatActions[0])}
            className={cn(
              'flex w-full items-center gap-2 bg-primary px-4 py-3 text-left text-sm text-primary-foreground transition-colors hover:bg-primary/90 sm:text-base',
              activeIndex === 0 && 'bg-primary/90 ring-2 ring-inset ring-primary-foreground/30'
            )}
          >
            <span className='truncate'>
              Cari: &ldquo;<strong className='font-semibold'>{trimmedQuery}</strong>&rdquo;
            </span>
          </button>

          <div className='max-h-80 overflow-y-auto'>
            {suggestions.commodities.length > 0 && (
              <div>
                <div className='flex items-center gap-2.5 border-b border-border/80 px-4 py-2.5 text-sm font-semibold text-foreground'>
                  <Sprout
                    className='size-4 shrink-0 text-primary dark:text-sidebar-primary'
                    aria-hidden='true'
                  />
                  <span>Jenis Komoditas</span>
                </div>
                <div className='py-1'>
                  {suggestions.commodities.map((item, idx) => {
                    const flatIdx = commodityStartIndex + idx
                    const isActive = activeIndex === flatIdx
                    return (
                      <button
                        key={item.id}
                        id={`${listboxId}-option-${flatIdx}`}
                        type='button'
                        role='option'
                        aria-selected={isActive}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        onClick={() => runAction(flatActions[flatIdx])}
                        className={cn(
                          'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground',
                          isActive && 'bg-accent text-accent-foreground'
                        )}
                      >
                        <span className='truncate'>
                          <HighlightedText text={item.label} query={trimmedQuery} />
                        </span>
                        <span className='shrink-0 text-xs text-muted-foreground'>
                          {item.categoryLabel}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {suggestions.offers.length > 0 && (
              <div>
                <div
                  className={cn(
                    'flex items-center gap-2.5 border-b border-border/80 px-4 py-2.5 text-sm font-semibold text-foreground',
                    suggestions.commodities.length > 0 && 'border-t'
                  )}
                >
                  <Store
                    className='size-4 shrink-0 text-primary dark:text-sidebar-primary'
                    aria-hidden='true'
                  />
                  <span>Penawaran Panen</span>
                </div>
                <div className='py-1'>
                  {suggestions.offers.map((item, idx) => {
                    const flatIdx = offerStartIndex + idx
                    const isActive = activeIndex === flatIdx
                    return (
                      <button
                        key={item.id}
                        id={`${listboxId}-option-${flatIdx}`}
                        type='button'
                        role='option'
                        aria-selected={isActive}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        onClick={() => runAction(flatActions[flatIdx])}
                        className={cn(
                          'flex w-full flex-col gap-0.5 px-4 py-2.5 text-left text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground',
                          isActive && 'bg-accent text-accent-foreground'
                        )}
                      >
                        <span className='line-clamp-2 leading-snug'>
                          <HighlightedText text={item.title} query={trimmedQuery} />
                        </span>
                        <span className='truncate text-xs text-muted-foreground'>
                          <HighlightedText text={item.subtitle} query={trimmedQuery} />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {suggestions.commodities.length === 0 && suggestions.offers.length === 0 && (
              <p className='px-4 py-3 text-sm text-muted-foreground'>
                Belum ada saran langsung. Tekan Enter untuk mencari &ldquo;{trimmedQuery}&rdquo;.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
