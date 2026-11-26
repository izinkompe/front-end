'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import { getOfferCountdownState } from '@/components/home/offer-card-helpers'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useOfferDetail } from '@/hooks/api/use-offers'
import { parseCheckoutSearchParams } from '@/lib/data/checkout-helpers'
import { formatPickupSlotLabel, parseWeightInputKg } from '@/lib/data/offer-detail-helpers'
import { CheckoutHeader } from './checkout-header'
import { CheckoutProgress } from './checkout-progress'
import { CheckoutReservationForm } from './checkout-reservation-form'
import { CheckoutSkeleton } from './checkout-skeleton'
import { CheckoutSummarySidebar } from './checkout-summary-sidebar'

export function CheckoutReservationView() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialQuery = parseCheckoutSearchParams({
    offerId: searchParams.get('offerId') ?? undefined,
    qty: searchParams.get('qty') ?? undefined,
    slotId: searchParams.get('slotId') ?? undefined,
    notes: searchParams.get('notes') ?? undefined,
    price: searchParams.get('price') ?? undefined,
  })

  const { data: currentUser } = useCurrentUser()
  const { data: offer, isPending, isError, refetch } = useOfferDetail(initialQuery.offerId)

  const [nowMs, setNowMs] = useState<number | null>(null)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [weightText, setWeightText] = useState(() => initialQuery.quantityText || '5')
  const [selectedSlotId, setSelectedSlotId] = useState(() => initialQuery.slotId)

  useEffect(() => {
    const updateNow = () => setNowMs(Date.now())
    updateNow()
    const intervalId = setInterval(updateNow, 1000)
    return () => clearInterval(intervalId)
  }, [])

  if (!initialQuery.offerId) {
    return (
      <>
        <CheckoutHeader backHref='/pasar' backLabel='Kembali ke pasar' />
        <div className='mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8'>
          <Alert>
            <AlertCircle aria-hidden='true' />
            <AlertTitle>Belum ada penawaran yang dipilih</AlertTitle>
            <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <span>Pilih komoditas panen dari pasar untuk melanjutkan ke checkout.</span>
              <Button size='sm' nativeButton={false} render={<Link href='/pasar' />}>
                Jelajahi pasar panen
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  if (isPending) {
    return (
      <>
        <CheckoutHeader
          backHref={`/pasar/penawaran/${initialQuery.offerId}`}
          backLabel='Detail penawaran'
        />
        <CheckoutSkeleton />
      </>
    )
  }

  if (isError || !offer) {
    return (
      <>
        <CheckoutHeader backHref='/pasar' backLabel='Kembali ke pasar' />
        <div className='mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8'>
          <Alert>
            <AlertCircle aria-hidden='true' />
            <AlertTitle>Penawaran tidak ditemukan</AlertTitle>
            <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <span>Penawaran komoditas mungkin sudah ditutup atau tautan tidak valid.</span>
              <div className='flex flex-wrap gap-2'>
                <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
                  <RefreshCw data-icon='inline-start' aria-hidden='true' />
                  Muat ulang
                </Button>
                <Button size='sm' nativeButton={false} render={<Link href='/pasar' />}>
                  Kembali ke katalog
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  const countdown = nowMs !== null ? getOfferCountdownState(offer.orderDeadline, nowMs) : null
  const isOfferUnavailable =
    Boolean(countdown?.isExpired) || offer.status !== 'active' || offer.availableStockKg <= 0

  const parsedWeightKg = parseWeightInputKg(weightText)
  const validQuantityKg =
    parsedWeightKg !== null && parsedWeightKg >= 0.001 && parsedWeightKg <= offer.availableStockKg
      ? parsedWeightKg
      : null
  const estimatedTotal =
    validQuantityKg !== null ? Math.round(validQuantityKg * offer.pricePerKg) : null

  const availableSlots = offer.pickupScheduleSlots.filter((slot) => slot.isAvailable !== false)
  const activeSlot = availableSlots.find((slot) => slot.id === selectedSlotId) ?? availableSlots[0]

  return (
    <>
      <CheckoutHeader backHref={`/pasar/penawaran/${offer.id}`} backLabel='Detail penawaran' />

      <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
        <div className='flex flex-col gap-3'>
          <h1 className='font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
            Konfirmasi checkout
          </h1>
          <CheckoutProgress currentStep={1} />
        </div>

        {!isOfferUnavailable &&
          countdown &&
          (countdown.urgency === 'critical' || countdown.urgency === 'soon') && (
            <Alert>
              <Clock aria-hidden='true' />
              <AlertTitle>
                Batas pemesanan penawaran: <span className='tabular-nums'>{countdown.label}</span>
              </AlertTitle>
              <AlertDescription>
                Buat reservasi sebelum batas waktu penawaran habis agar stok terkunci untuk Anda.
              </AlertDescription>
            </Alert>
          )}

        <div className='offer-sticky-parent grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px]'>
          <CheckoutReservationForm
            offer={offer}
            isOfferUnavailable={isOfferUnavailable}
            currentUser={currentUser}
            initialQuantityText={initialQuery.quantityText}
            initialSlotId={initialQuery.slotId}
            initialNotes={initialQuery.notes}
            expectedPricePerKg={initialQuery.expectedPricePerKg}
            weightText={weightText}
            selectedSlotId={selectedSlotId}
            onWeightTextChange={setWeightText}
            onSelectedSlotIdChange={setSelectedSlotId}
            onRequireAuth={() => setAuthDialogOpen(true)}
            onOrderCreated={(createdOrder) => {
              router.push(`/pesanan/${createdOrder.id}/bayar`)
            }}
          />

          <aside aria-label='Ringkasan pesanan' className='lg:sticky lg:top-24 lg:self-start'>
            <CheckoutSummarySidebar
              commodityName={offer.commodityName}
              farmerName={offer.farmerName}
              photoUrl={offer.photos[0]}
              quantityKg={validQuantityKg}
              pricePerKg={offer.pricePerKg}
              totalPrice={estimatedTotal}
              pickupAreaLabel={offer.pickupAddressArea}
              scheduleLabel={activeSlot ? formatPickupSlotLabel(activeSlot) : undefined}
            />
          </aside>
        </div>
      </div>

      <BuyerAuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  )
}
