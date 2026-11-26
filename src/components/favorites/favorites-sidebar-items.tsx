'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Plus, ShieldCheck, Sprout, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useToggleFollowFarmer } from '@/hooks/api/use-farmer-store'
import {
  useDeleteBookmarkList,
  useToggleBookmarkListOffer,
  type HydratedBookmarkList,
} from '@/hooks/api/use-favorites'
import type { FarmerStoreProfile } from '@/types/api/farmers'
import type { Offer } from '@/types/api/offers'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function SidebarOfferRow({
  offer,
  onNavigate,
  onRemove,
  removing,
  removeLabel,
}: {
  offer: Offer
  onNavigate: () => void
  onRemove: () => void
  removing?: boolean
  removeLabel: string
}) {
  const detailHref = '/pasar/penawaran/' + encodeURIComponent(offer.id)

  return (
    <li className='flex items-center gap-3 rounded-xl border border-border p-2.5 transition-colors hover:bg-muted/40'>
      <Link
        href={detailHref}
        onClick={onNavigate}
        className='flex min-w-0 flex-1 items-center gap-3'
      >
        <div className='relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted'>
          {offer.photos[0] ? (
            <Image
              src={offer.photos[0]}
              alt={offer.commodityName}
              fill
              sizes='56px'
              className='object-cover'
            />
          ) : (
            <Sprout className='size-5 text-muted-foreground' aria-hidden='true' />
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-foreground'>{offer.commodityName}</p>
          <p className='truncate text-xs text-muted-foreground'>{offer.farmerName}</p>
          <p className='mt-0.5 text-xs font-medium text-primary tabular-nums'>
            {formatRupiah(offer.pricePerKg)} / kg
          </p>
        </div>
      </Link>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={onRemove}
        disabled={removing}
        aria-label={removeLabel}
        className='shrink-0 text-muted-foreground hover:text-destructive'
      >
        {removing ? <Spinner /> : <Trash2 className='size-4' aria-hidden='true' />}
      </Button>
    </li>
  )
}

export function SidebarFarmerRow({
  farmer,
  onNavigate,
}: {
  farmer: FarmerStoreProfile
  onNavigate: () => void
}) {
  const follow = useToggleFollowFarmer(farmer.id)
  const storeHref = '/petani/' + encodeURIComponent(farmer.id)

  return (
    <li className='flex items-center justify-between gap-3 rounded-xl border border-border p-2.5 transition-colors hover:bg-muted/40'>
      <Link
        href={storeHref}
        onClick={onNavigate}
        className='flex min-w-0 flex-1 items-center gap-3'
      >
        <Avatar className='size-11 shrink-0'>
          {farmer.avatarUrl && <AvatarImage src={farmer.avatarUrl} alt={farmer.farmName} />}
          <AvatarFallback>{getInitials(farmer.farmName)}</AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-1.5'>
            <p className='truncate text-sm font-semibold text-foreground'>{farmer.farmName}</p>
            {farmer.isVerifiedFarmer && (
              <ShieldCheck className='size-3.5 shrink-0 text-primary' aria-hidden='true' />
            )}
          </div>
          <p className='mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground'>
            <MapPin className='size-3 shrink-0' aria-hidden='true' />
            <span className='truncate'>{farmer.areaName}</span>
          </p>
        </div>
      </Link>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        disabled={follow.isPending}
        onClick={() => follow.mutate()}
        aria-label={'Berhenti ikuti ' + farmer.farmName}
      >
        {follow.isPending && <Spinner data-icon='inline-start' />}
        <span>Berhenti</span>
      </Button>
    </li>
  )
}

export function CustomListDetail({
  list,
  favoriteOffers,
  onNavigate,
  onDeleted,
}: {
  list: HydratedBookmarkList
  favoriteOffers: Offer[]
  onNavigate: () => void
  onDeleted: () => void
}) {
  const deleteList = useDeleteBookmarkList()
  const toggleOffer = useToggleBookmarkListOffer()
  const availableToAdd = favoriteOffers.filter((offer) => !list.offerIds.includes(offer.id))

  async function handleDeleteList() {
    await deleteList.mutateAsync(list.id)
    onDeleted()
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-start justify-between gap-3 rounded-xl bg-muted/40 p-3'>
        <div className='min-w-0 flex-1'>
          <p className='text-sm text-muted-foreground'>
            {list.description || 'Daftar bookmark khusus untuk komoditas pilihan Anda.'}
          </p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={handleDeleteList}
          disabled={deleteList.isPending}
          className='shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
        >
          {deleteList.isPending ? (
            <Spinner data-icon='inline-start' />
          ) : (
            <Trash2 data-icon='inline-start' aria-hidden='true' />
          )}
          <span>Hapus</span>
        </Button>
      </div>

      {list.offers.length > 0 ? (
        <ul className='flex flex-col gap-2.5'>
          {list.offers.map((offer) => (
            <SidebarOfferRow
              key={offer.id}
              offer={offer}
              onNavigate={onNavigate}
              removing={toggleOffer.isPending && toggleOffer.variables?.offerId === offer.id}
              onRemove={() => toggleOffer.mutate({ listId: list.id, offerId: offer.id })}
              removeLabel={'Hapus ' + offer.commodityName + ' dari ' + list.name}
            />
          ))}
        </ul>
      ) : (
        <div className='rounded-xl border border-dashed border-border px-4 py-6 text-center'>
          <p className='text-sm font-medium text-foreground'>Daftar ini masih kosong</p>
          <p className='mt-1 text-xs text-muted-foreground'>
            Tambahkan komoditas dari favorit Anda atau jelajahi Pasar Panen.
          </p>
          <Button
            variant='outline'
            size='sm'
            className='mt-3'
            nativeButton={false}
            render={<Link href='/pasar' onClick={onNavigate} />}
          >
            Jelajahi pasar panen
          </Button>
        </div>
      )}

      {availableToAdd.length > 0 && (
        <div className='flex flex-col gap-2 pt-2'>
          <Separator />
          <p className='pt-1 text-sm font-semibold text-muted-foreground'>Tambahkan dari Favorit</p>
          <ul className='flex flex-col gap-2'>
            {availableToAdd.slice(0, 5).map((offer) => (
              <li
                key={offer.id}
                className='flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2'
              >
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-foreground'>
                    {offer.commodityName}
                  </p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {formatRupiah(offer.pricePerKg)} / kg
                  </p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={toggleOffer.isPending && toggleOffer.variables?.offerId === offer.id}
                  onClick={() => toggleOffer.mutate({ listId: list.id, offerId: offer.id })}
                >
                  <Plus className='size-3.5' aria-hidden='true' />
                  <span>Tambah</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
