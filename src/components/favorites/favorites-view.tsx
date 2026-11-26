'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Settings, ShieldCheck, Star } from 'lucide-react'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useHydrated } from '@/hooks/use-hydrated'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useToggleFollowFarmer } from '@/hooks/api/use-farmer-store'
import { useFavorites } from '@/hooks/api/use-favorites'
import type { FarmerStoreProfile } from '@/types/api/farmers'
import { SavedOfferList } from './saved-offer-list'

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function FollowedFarmerRow({ farmer }: { farmer: FarmerStoreProfile }) {
  const follow = useToggleFollowFarmer(farmer.id)
  const storeHref = '/petani/' + encodeURIComponent(farmer.id)

  return (
    <li>
      <Card>
        <CardContent className='flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center'>
          <div className='flex min-w-0 items-start gap-3'>
            <Avatar className='size-11 shrink-0'>
              {farmer.avatarUrl && <AvatarImage src={farmer.avatarUrl} alt={farmer.farmName} />}
              <AvatarFallback>{getInitials(farmer.farmName)}</AvatarFallback>
            </Avatar>

            <div className='flex min-w-0 flex-1 flex-col gap-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <Link
                  href={storeHref}
                  className='font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:underline wrap-anywhere'
                >
                  {farmer.farmName}
                </Link>
                {farmer.isVerifiedFarmer && (
                  <Badge variant='secondary' className='gap-1'>
                    <ShieldCheck className='size-3' aria-hidden='true' />
                    <span>Terverifikasi</span>
                  </Badge>
                )}
              </div>

              <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground'>
                <span className='inline-flex items-center gap-1'>
                  <MapPin className='size-3.5 shrink-0' aria-hidden='true' />
                  <span>{farmer.areaName}</span>
                </span>
                <span className='tabular-nums'>
                  {farmer.stats.activeOffersCount} penawaran aktif
                </span>
                {farmer.stats.totalRatings > 0 && (
                  <span className='inline-flex items-center gap-1 tabular-nums'>
                    <Star className='size-3.5 shrink-0 fill-current' aria-hidden='true' />
                    <span>
                      {farmer.stats.averageRating.toFixed(1)} ({farmer.stats.totalRatings})
                    </span>
                  </span>
                )}
              </div>

              {follow.isError && (
                <p role='alert' className='text-sm text-destructive'>
                  Gagal berhenti mengikuti. Coba lagi.
                </p>
              )}
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-2 sm:shrink-0'>
            <Button
              variant='outline'
              size='sm'
              nativeButton={false}
              render={<Link href={storeHref} />}
            >
              Kunjungi kebun
            </Button>
            <Button
              variant='ghost'
              size='sm'
              disabled={follow.isPending}
              onClick={() => follow.mutate()}
              aria-label={'Berhenti ikuti ' + farmer.farmName}
            >
              {follow.isPending && <Spinner data-icon='inline-start' />}
              <span>Berhenti ikuti</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  )
}

function EmptyFavorites({ title, description }: { title: string; description: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link href='/pasar' />}>
          Jelajahi pasar panen
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export function FavoritesView() {
  const isHydrated = useHydrated()
  const { data: user, isPending: userPending } = useCurrentUser()
  const { data, isLoading, isError, refetch } = useFavorites()
  const [authOpen, setAuthOpen] = useState(false)

  const isBuyer = isHydrated && user?.role === 'buyer'
  const isWrongRole = Boolean(isHydrated && user && user.role !== 'buyer')

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-bold sm:text-3xl'>Favorit</h1>
          <p className='text-sm text-muted-foreground'>
            Simpan penawaran panen pilihan dan ikuti petani favorit untuk mendapat pengingat panen
            terdekat.
          </p>
        </div>

        {isBuyer && (
          <Button
            variant='outline'
            size='sm'
            nativeButton={false}
            render={<Link href='/akun/pengaturan' />}
          >
            <Settings data-icon='inline-start' aria-hidden='true' />
            <span>Atur radius pengingat</span>
          </Button>
        )}
      </header>

      {!isHydrated || userPending || isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : !isBuyer ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {isWrongRole
                ? 'Gunakan akun pembeli untuk melihat favorit'
                : 'Masuk untuk melihat favorit'}
            </EmptyTitle>
            <EmptyDescription>
              {isWrongRole
                ? 'Daftar komoditas favorit dan petani yang diikuti hanya tersedia pada akun pembeli.'
                : 'Masuk sebagai pembeli untuk menyimpan komoditas dan mengikuti petani favorit.'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setAuthOpen(true)}>
              {isWrongRole ? 'Ganti ke akun pembeli' : 'Masuk sebagai pembeli'}
            </Button>
          </EmptyContent>
        </Empty>
      ) : isError ? (
        <Alert variant='destructive'>
          <AlertDescription className='flex flex-wrap items-center justify-between gap-3'>
            <span>Favorit gagal dimuat.</span>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              Muat ulang
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        data && (
          <Tabs defaultValue='offers' className='gap-5'>
            <TabsList variant='line' className='w-full justify-start border-b border-border p-0'>
              <TabsTrigger value='offers' className='flex-none gap-2 px-1 pb-2.5 after:bottom-0'>
                <span>Komoditas favorit</span>
                <Badge variant='secondary' className='h-5 px-1.5 text-xs tabular-nums'>
                  {data.offers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value='farmers' className='flex-none gap-2 px-1 pb-2.5 after:bottom-0'>
                <span>Petani diikuti</span>
                <Badge variant='secondary' className='h-5 px-1.5 text-xs tabular-nums'>
                  {data.farmers.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='offers'>
              {data.offers.length ? (
                <SavedOfferList offers={data.offers} onSignIn={() => setAuthOpen(true)} />
              ) : (
                <EmptyFavorites
                  title='Belum ada komoditas favorit'
                  description='Klik ikon simpan pada kartu komoditas di Pasar Panen untuk menambahkannya ke daftar ini.'
                />
              )}
            </TabsContent>

            <TabsContent value='farmers'>
              {data.farmers.length ? (
                <ul className='flex flex-col gap-3'>
                  {data.farmers.map((farmer) => (
                    <FollowedFarmerRow farmer={farmer} key={farmer.id} />
                  ))}
                </ul>
              ) : (
                <EmptyFavorites
                  title='Belum mengikuti petani'
                  description='Buka profil kebun petani dan tekan Ikuti untuk memantau panen terbaru mereka.'
                />
              )}
            </TabsContent>
          </Tabs>
        )
      )}

      <BuyerAuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  )
}
