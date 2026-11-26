'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import { SavedOfferList } from '@/components/favorites/saved-offer-list'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useOffers } from '@/hooks/api/use-offers'
import { readRecentlyViewed } from '@/lib/data/recently-viewed'

export function AccountRecentlyViewed({ userId }: { userId: string }) {
  const [ids] = useState(() => readRecentlyViewed(userId))
  const [authOpen, setAuthOpen] = useState(false)
  const { data, isPending, isError, refetch } = useOffers()

  if (ids.length > 0 && isPending) return <Skeleton className='h-36 w-full' />
  if (ids.length > 0 && isError) {
    return (
      <Alert variant='destructive'>
        <AlertDescription className='flex flex-wrap items-center justify-between gap-3'>
          <span>Daftar terakhir dilihat gagal dimuat.</span>
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            Muat ulang
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const lookup = new Map(data?.map((offer) => [offer.id, offer]))
  const offers = ids.flatMap((id) => {
    const offer = lookup.get(id)
    return offer ? [offer] : []
  })

  if (!offers.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Belum ada penawaran yang dilihat</EmptyTitle>
          <EmptyDescription>
            Penawaran hasil panen yang Anda buka di Pasar Panen akan tercatat di sini.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button nativeButton={false} render={<Link href='/pasar' />}>
            Jelajahi pasar panen
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <>
      <SavedOfferList offers={offers} onSignIn={() => setAuthOpen(true)} />
      <BuyerAuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  )
}
