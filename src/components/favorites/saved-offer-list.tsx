'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CatalogOfferCard } from '@/components/catalog/catalog-offer-card'
import type { ShareButtonState } from '@/components/home/buyer-expiring-offer-card'
import {
  buildOfferDetailHref,
  calculateStraightLineDistanceKm,
} from '@/components/home/offer-card-helpers'
import { useSelectedLocation } from '@/components/providers/location-provider'
import { useOfferFavorites } from '@/hooks/api/use-favorites'
import { findRegionCoordinates } from '@/lib/data/regions'
import type { Offer } from '@/types/api/offers'

export function SavedOfferList({ offers, onSignIn }: { offers: Offer[]; onSignIn: () => void }) {
  const { selectedLocation } = useSelectedLocation()
  const [status, setStatus] = useState('')
  const [share, setShare] = useState<{ id: string; state: ShareButtonState }>()
  const [nowMs, setNowMs] = useState<number | null>(null)
  const lastStatusRef = useRef('')

  const announcePolite = useCallback((message: string) => {
    const next = message === lastStatusRef.current ? `${message}\u00A0` : message
    lastStatusRef.current = next
    setStatus(next)
  }, [])

  const { favoriteIds, toggleFavorite } = useOfferFavorites(onSignIn, announcePolite)
  const userCoords = findRegionCoordinates(selectedLocation.provinceId, selectedLocation.label)

  useEffect(() => {
    const updateNow = () => setNowMs(Date.now())
    updateNow()
    const intervalId = setInterval(updateNow, 1000)
    return () => clearInterval(intervalId)
  }, [])

  async function shareOffer(offer: Offer) {
    try {
      await navigator.clipboard.writeText(
        new URL(buildOfferDetailHref(offer.id), window.location.origin).href
      )
      setShare({ id: offer.id, state: 'copied' })
      announcePolite('Tautan penawaran disalin.')
    } catch {
      setShare({ id: offer.id, state: 'failed' })
      announcePolite('Tautan gagal disalin.')
    }
  }

  return (
    <>
      <p role='status' aria-live='polite' className='sr-only'>
        {status}
      </p>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {offers.map((offer) => {
          const distanceKm =
            userCoords && offer.latitude !== undefined && offer.longitude !== undefined
              ? calculateStraightLineDistanceKm(userCoords, {
                  lat: offer.latitude,
                  lng: offer.longitude,
                })
              : null

          return (
            <CatalogOfferCard
              key={offer.id}
              offer={offer}
              distanceKm={distanceKm}
              nowMs={nowMs}
              priorityImage={false}
              isFavorite={favoriteIds.has(offer.id)}
              shareState={share?.id === offer.id ? share.state : 'idle'}
              onToggleFavorite={toggleFavorite}
              onShare={shareOffer}
            />
          )
        })}
      </div>
    </>
  )
}
