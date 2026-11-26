'use client'

import { useState } from 'react'
import { ListFilter, Search, Sprout, X } from 'lucide-react'
import { CatalogOfferCard } from '@/components/catalog/catalog-offer-card'
import type { ShareButtonState } from '@/components/home/buyer-expiring-offer-card'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type {
  FarmerOfferListItem,
  FarmerOfferShowcaseId,
  FarmerOfferShowcaseItem,
  FarmerOfferSort,
} from '@/lib/data/farmer-store-helpers'
import { cn } from '@/lib/utils'
import type { Offer } from '@/types/api/offers'

interface FarmerOffersTabProps {
  farmName: string
  showcases: ReadonlyArray<FarmerOfferShowcaseItem>
  selectedShowcase: FarmerOfferShowcaseId
  searchQuery: string
  sort: FarmerOfferSort
  items: ReadonlyArray<FarmerOfferListItem>
  nowMs: number | null
  favoriteIds: ReadonlySet<string>
  shareStates: Record<string, ShareButtonState>
  onSelectShowcase: (showcaseId: FarmerOfferShowcaseId) => void
  onSearchChange: (value: string) => void
  onSortChange: (value: FarmerOfferSort) => void
  onResetFilters: () => void
  onToggleFavorite: (offer: Offer) => void
  onShareOffer: (offer: Offer) => void
}

const sortLabels: Record<FarmerOfferSort, string> = {
  terdekat: 'Terdekat dari lokasi acuan',
  expiring: 'Batas pesan terdekat',
  termurah: 'Harga termurah',
  terbaru: 'Terbaru',
}

function ShowcaseList({
  showcases,
  selectedShowcase,
  onSelect,
}: {
  showcases: ReadonlyArray<FarmerOfferShowcaseItem>
  selectedShowcase: FarmerOfferShowcaseId
  onSelect: (id: FarmerOfferShowcaseId) => void
}) {
  return (
    <ul className='flex flex-col gap-1'>
      {showcases.map((item) => {
        const isSelected = item.id === selectedShowcase
        return (
          <li key={item.id}>
            <button
              type='button'
              aria-current={isSelected ? 'true' : undefined}
              onClick={() => onSelect(item.id)}
              className={cn(
                'flex min-h-10 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                isSelected
                  ? 'bg-secondary font-semibold text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span className='truncate'>{item.label}</span>
              <span className='shrink-0 text-xs tabular-nums'>{item.count}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function FarmerOffersTab({
  farmName,
  showcases,
  selectedShowcase,
  searchQuery,
  sort,
  items,
  nowMs,
  favoriteIds,
  shareStates,
  onSelectShowcase,
  onSearchChange,
  onSortChange,
  onResetFilters,
  onToggleFavorite,
  onShareOffer,
}: FarmerOffersTabProps) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const activeShowcase = showcases.find((item) => item.id === selectedShowcase) ?? showcases[0]

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8'>
      <aside aria-label='Etalase kebun' className='hidden lg:block'>
        <div className='sticky top-28 rounded-2xl border border-border bg-card p-4'>
          <h2 className='mb-3 px-2 type-h4 text-foreground'>Etalase Kebun</h2>
          <ShowcaseList
            showcases={showcases}
            selectedShowcase={selectedShowcase}
            onSelect={onSelectShowcase}
          />
        </div>
      </aside>

      <div className='flex min-w-0 flex-col gap-5'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap items-center gap-2.5'>
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger
                render={<Button type='button' variant='outline' size='sm' className='lg:hidden' />}
              >
                <ListFilter data-icon='inline-start' aria-hidden='true' />
                <span>{activeShowcase?.label ?? 'Etalase'}</span>
              </SheetTrigger>
              <SheetContent side='left' className='sm:max-w-sm'>
                <SheetHeader className='px-5 py-4 pr-14'>
                  <SheetTitle>Etalase Kebun</SheetTitle>
                  <SheetDescription>Pilih kelompok penawaran dari {farmName}.</SheetDescription>
                </SheetHeader>
                <div className='p-5'>
                  <ShowcaseList
                    showcases={showcases}
                    selectedShowcase={selectedShowcase}
                    onSelect={(id) => {
                      onSelectShowcase(id)
                      setMobileSheetOpen(false)
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <h2 className='type-h3 font-bold text-foreground'>
              {activeShowcase?.label ?? 'Semua Penawaran'}{' '}
              <span className='text-sm font-normal text-muted-foreground tabular-nums'>
                ({items.length})
              </span>
            </h2>
          </div>

          <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center'>
            <InputGroup className='sm:w-60'>
              <InputGroupAddon align='inline-start'>
                <Search aria-hidden='true' />
              </InputGroupAddon>
              <InputGroupInput
                type='search'
                aria-label={`Cari komoditas di ${farmName}`}
                placeholder='Cari di kebun ini'
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
              />
              {searchQuery && (
                <InputGroupAddon align='inline-end'>
                  <InputGroupButton
                    size='icon-xs'
                    aria-label='Hapus kata kunci'
                    onClick={() => onSearchChange('')}
                  >
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>

            <Select
              value={sort}
              onValueChange={(value) => {
                if (value) {
                  onSortChange(value as FarmerOfferSort)
                }
              }}
            >
              <SelectTrigger aria-label='Urutkan penawaran' size='sm' className='w-full sm:w-56'>
                <SelectValue>{sortLabels[sort]}</SelectValue>
              </SelectTrigger>
              <SelectContent align='end'>
                <SelectGroup>
                  <SelectItem value='terdekat'>{sortLabels.terdekat}</SelectItem>
                  <SelectItem value='expiring'>{sortLabels.expiring}</SelectItem>
                  <SelectItem value='termurah'>{sortLabels.termurah}</SelectItem>
                  <SelectItem value='terbaru'>{sortLabels.terbaru}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {items.length === 0 ? (
          <Empty className='border border-border bg-card py-12'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Sprout />
              </EmptyMedia>
              <EmptyTitle>Belum ada penawaran yang cocok</EmptyTitle>
              <EmptyDescription>
                Coba pilih etalase lain atau hapus kata kunci pencarian di kebun ini.
              </EmptyDescription>
            </EmptyHeader>
            {(selectedShowcase !== 'semua' || searchQuery.trim() !== '') && (
              <EmptyContent>
                <Button type='button' variant='outline' size='sm' onClick={onResetFilters}>
                  Tampilkan semua penawaran
                </Button>
              </EmptyContent>
            )}
          </Empty>
        ) : (
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
            {items.map((item, index) => (
              <CatalogOfferCard
                key={item.offer.id}
                offer={item.offer}
                distanceKm={item.distanceKm}
                nowMs={nowMs}
                priorityImage={index < 3}
                isFavorite={favoriteIds.has(item.offer.id)}
                shareState={shareStates[item.offer.id] ?? 'idle'}
                onToggleFavorite={onToggleFavorite}
                onShare={onShareOffer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
