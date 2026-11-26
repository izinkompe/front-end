'use client'

import Link from 'next/link'
import {
  BadgeCheck,
  Check,
  Info,
  MapPin,
  Share2,
  Sprout,
  Star,
  UserCheck,
  UserPlus,
} from 'lucide-react'
import type { ShareButtonState } from '@/components/home/buyer-expiring-offer-card'
import { formatWeightKg } from '@/components/home/offer-card-helpers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getFarmInitials, getFarmerTypeLabel } from '@/lib/data/farmer-store-helpers'
import { cn } from '@/lib/utils'
import type { FarmerStoreProfile } from '@/types/api/farmers'

interface FarmerStoreHeaderProps {
  farmer: FarmerStoreProfile
  isFollowPending: boolean
  shareState: ShareButtonState
  onToggleFollow: () => void
  onOpenInfo: () => void
  onShareStore: () => void
  onSelectReviewsTab: () => void
}

export function FarmerStoreHeader({
  farmer,
  isFollowPending,
  shareState,
  onToggleFollow,
  onOpenInfo,
  onShareStore,
  onSelectReviewsTab,
}: FarmerStoreHeaderProps) {
  const farmerTypeLabel = getFarmerTypeLabel(farmer.farmerType)
  const initials = getFarmInitials(farmer.farmName)
  const showOwnerSubtitle =
    farmer.farmerDisplayName.trim().toLowerCase() !== farmer.farmName.trim().toLowerCase()

  return (
    <div className='flex flex-col gap-4'>
      <Breadcrumb aria-label='Navigasi halaman'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href='/' />}>Beranda</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href='/pasar' />}>Pasar</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{farmer.farmName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section
        aria-label='Profil toko petani'
        className='rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xs sm:p-6'
      >
        <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start'>
            <Avatar className='size-16 shrink-0 sm:size-20'>
              {farmer.avatarUrl && <AvatarImage src={farmer.avatarUrl} alt={farmer.farmName} />}
              <AvatarFallback className='bg-primary/10 text-lg font-semibold text-primary'>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className='flex min-w-0 flex-1 flex-col gap-3'>
              <div className='flex flex-col gap-1.5'>
                <div className='flex flex-wrap items-center gap-2'>
                  {farmer.isVerifiedFarmer && (
                    <Badge variant='secondary' className='gap-1 font-medium'>
                      <BadgeCheck
                        data-icon='inline-start'
                        aria-hidden='true'
                        className='text-primary'
                      />
                      <span>Petani Terverifikasi</span>
                    </Badge>
                  )}
                  <Badge variant='outline' className='gap-1 text-muted-foreground'>
                    <Sprout data-icon='inline-start' aria-hidden='true' />
                    <span>{farmerTypeLabel}</span>
                  </Badge>
                </div>

                <h1 className='text-[clamp(1.375rem,1.1rem+0.9vw,1.875rem)] leading-tight font-bold text-foreground'>
                  {farmer.farmName}
                </h1>

                <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground'>
                  {showOwnerSubtitle && <span>Dikelola {farmer.farmerDisplayName}</span>}
                  <span className='inline-flex items-center gap-1.5 text-foreground'>
                    <MapPin className='size-4 shrink-0 text-primary' aria-hidden='true' />
                    <span>{farmer.areaName}</span>
                  </span>
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  type='button'
                  variant={farmer.isFollowing ? 'outline' : 'default'}
                  size='sm'
                  aria-pressed={farmer.isFollowing}
                  disabled={isFollowPending}
                  onClick={onToggleFollow}
                  className='min-w-30 rounded-lg'
                >
                  {isFollowPending ? (
                    <Spinner data-icon='inline-start' />
                  ) : farmer.isFollowing ? (
                    <UserCheck data-icon='inline-start' aria-hidden='true' />
                  ) : (
                    <UserPlus data-icon='inline-start' aria-hidden='true' />
                  )}
                  <span>{farmer.isFollowing ? 'Mengikuti' : 'Ikuti'}</span>
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={onOpenInfo}
                  className='rounded-lg'
                >
                  <Info data-icon='inline-start' aria-hidden='true' />
                  <span>Info Kebun</span>
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  size='icon-sm'
                  onClick={onShareStore}
                  aria-label={`Bagikan tautan ${farmer.farmName}`}
                  className='rounded-lg'
                >
                  {shareState === 'copied' ? (
                    <Check aria-hidden='true' className='text-primary' />
                  ) : (
                    <Share2 aria-hidden='true' />
                  )}
                </Button>

                {shareState !== 'idle' && (
                  <span
                    aria-hidden='true'
                    className={cn(
                      'text-xs font-medium',
                      shareState === 'copied' ? 'text-primary' : 'text-destructive'
                    )}
                  >
                    {shareState === 'copied' ? 'Tautan disalin' : 'Gagal menyalin'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-6 border-t border-border pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6'>
            <button
              type='button'
              onClick={onSelectReviewsTab}
              className='flex min-h-11 flex-col items-start rounded-lg px-2 py-1 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
            >
              <span className='inline-flex items-center gap-1.5 text-lg font-bold text-foreground tabular-nums'>
                <Star className='size-5 fill-chart-2 text-chart-2' aria-hidden='true' />
                <span>
                  {farmer.stats.totalRatings > 0
                    ? farmer.stats.averageRating.toFixed(1).replace('.', ',')
                    : 'Baru'}
                </span>
                {farmer.stats.totalReviews > 0 && (
                  <span className='text-sm font-normal text-muted-foreground'>
                    ({farmer.stats.totalReviews} ulasan)
                  </span>
                )}
              </span>
              <span className='text-xs text-muted-foreground underline underline-offset-4'>
                Rating dan ulasan
              </span>
            </button>

            <div className='flex flex-col gap-0.5 px-1'>
              <span className='text-lg font-bold text-foreground tabular-nums'>
                {formatWeightKg(farmer.stats.totalDistributedKg)}
              </span>
              <span className='text-xs text-muted-foreground'>Pangan tersalurkan</span>
            </div>

            <div className='flex flex-col gap-0.5 px-1'>
              <span className='text-lg font-bold text-foreground tabular-nums'>
                {farmer.stats.followerCount}
              </span>
              <span className='text-xs text-muted-foreground'>Pengikut</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
