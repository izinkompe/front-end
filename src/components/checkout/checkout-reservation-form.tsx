'use client'

import { useRef, useState, type FormEvent } from 'react'
import { AlertCircle, Lock } from 'lucide-react'
import { formatPricePerKg, formatWeightKg } from '@/components/home/offer-card-helpers'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api/errors'
import { useCreateOrder } from '@/hooks/api/use-orders'
import { hasOfferPriceChanged, validateCheckoutContact } from '@/lib/data/checkout-helpers'
import {
  formatPickupSlotLabel,
  getWeightPresetsKg,
  parseWeightInputKg,
  validateOrderWeightKg,
} from '@/lib/data/offer-detail-helpers'
import type { User } from '@/types/api/auth'
import type { Offer } from '@/types/api/offers'
import type { Order, OrderBuyerAddress } from '@/types/api/orders'
import { CheckoutBuyerAddressCard } from './checkout-buyer-address-card'
import { CheckoutContactCard } from './checkout-contact-card'
import { CheckoutTermsCard } from './checkout-terms-card'

interface CheckoutReservationFormProps {
  offer: Offer
  isOfferUnavailable: boolean
  currentUser: User | null | undefined
  initialQuantityText: string
  initialSlotId: string
  initialNotes: string
  expectedPricePerKg: number | null
  weightText: string
  selectedSlotId: string
  onWeightTextChange: (value: string) => void
  onSelectedSlotIdChange: (value: string) => void
  onRequireAuth: () => void
  onOrderCreated: (order: Order) => void
}

export function CheckoutReservationForm({
  offer,
  isOfferUnavailable,
  currentUser,
  initialNotes,
  expectedPricePerKg,
  weightText,
  selectedSlotId,
  onWeightTextChange,
  onSelectedSlotIdChange,
  onRequireAuth,
  onOrderCreated,
}: CheckoutReservationFormProps) {
  const createOrderMutation = useCreateOrder()
  const weightInputRef = useRef<HTMLInputElement | null>(null)
  const contactNameRef = useRef<HTMLInputElement | null>(null)
  const contactPhoneRef = useRef<HTMLInputElement | null>(null)

  const availableSlots = offer.pickupScheduleSlots.filter((slot) => slot.isAvailable !== false)
  const defaultSlotId = availableSlots[0]?.id ?? ''
  const activeSlotId = availableSlots.some((slot) => slot.id === selectedSlotId)
    ? selectedSlotId
    : defaultSlotId

  const presets = getWeightPresetsKg(offer.availableStockKg)

  const [notes, setNotes] = useState(initialNotes)
  const [contactName, setContactName] = useState(() => currentUser?.name ?? '')
  const [contactPhone, setContactPhone] = useState(() => currentUser?.phone ?? '')
  const [selectedAddressId, setSelectedAddressId] = useState(
    () =>
      currentUser?.addresses?.find((addr) => addr.isDefault)?.id ??
      currentUser?.addresses?.[0]?.id ??
      ''
  )
  const [customBuyerAddress, setCustomBuyerAddress] = useState<OrderBuyerAddress | null>(null)
  const [acknowledgedPrice, setAcknowledgedPrice] = useState<number | null>(null)
  const [priceConfirmed, setPriceConfirmed] = useState(false)

  const [weightTouched, setWeightTouched] = useState(false)
  const [slotTouched, setSlotTouched] = useState(false)
  const [nameTouched, setNameTouched] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const effectiveContactName = nameTouched ? contactName : contactName || currentUser?.name || ''
  const effectiveContactPhone = phoneTouched
    ? contactPhone
    : contactPhone || currentUser?.phone || ''
  const buyerAddresses = currentUser?.addresses ?? []
  const resolvedAddressId = buyerAddresses.some((addr) => addr.id === selectedAddressId)
    ? selectedAddressId
    : (buyerAddresses.find((addr) => addr.isDefault)?.id ?? buyerAddresses[0]?.id ?? '')
  const matchedBuyerAddress = buyerAddresses.find((addr) => addr.id === resolvedAddressId)
  const activeBuyerAddress =
    customBuyerAddress ??
    (matchedBuyerAddress
      ? {
          label: matchedBuyerAddress.label,
          areaName: matchedBuyerAddress.areaName,
          fullAddress: matchedBuyerAddress.fullAddress,
        }
      : undefined)

  const parsedWeightKg = parseWeightInputKg(weightText)
  const weightError = validateOrderWeightKg(parsedWeightKg, offer.availableStockKg)
  const slotError =
    availableSlots.length > 0 && !activeSlotId ? 'Pilih salah satu jadwal pengambilan.' : null
  const contactErrors = validateCheckoutContact({
    contactName: effectiveContactName,
    contactPhone: effectiveContactPhone,
  })

  const isNonBuyerUser = Boolean(currentUser && currentUser.role !== 'buyer')
  const priceChangedFromDetail =
    hasOfferPriceChanged(expectedPricePerKg, offer.pricePerKg) &&
    acknowledgedPrice !== offer.pricePerKg

  const showWeightError = (weightTouched || submitAttempted) && Boolean(weightError)
  const showSlotError = (slotTouched || submitAttempted) && Boolean(slotError)
  const showNameError = (nameTouched || submitAttempted) && Boolean(contactErrors.contactName)
  const showPhoneError = (phoneTouched || submitAttempted) && Boolean(contactErrors.contactPhone)
  const showPriceAckError = submitAttempted && priceChangedFromDetail && !priceConfirmed

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitAttempted(true)
    setWeightTouched(true)
    setSlotTouched(true)
    setNameTouched(true)
    setPhoneTouched(true)

    if (isOfferUnavailable) return

    if (!currentUser) {
      onRequireAuth()
      return
    }

    if (currentUser.role !== 'buyer') return

    if (weightError || parsedWeightKg === null) {
      weightInputRef.current?.focus()
      return
    }

    if (slotError || !activeSlotId) {
      return
    }

    if (contactErrors.contactName) {
      contactNameRef.current?.focus()
      return
    }

    if (contactErrors.contactPhone) {
      contactPhoneRef.current?.focus()
      return
    }

    if (priceChangedFromDetail && !priceConfirmed) {
      return
    }

    try {
      const created = await createOrderMutation.mutateAsync({
        offerId: offer.id,
        quantityKg: parsedWeightKg,
        scheduleSlotId: activeSlotId,
        notes: notes.trim() || undefined,
        contactName: effectiveContactName.trim(),
        contactPhone: effectiveContactPhone.trim(),
        buyerAddress: activeBuyerAddress,
        acceptedPricePerKg: offer.pricePerKg,
      })

      onOrderCreated(created)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'PRICE_CHANGED') {
        setPriceConfirmed(false)
        setAcknowledgedPrice(null)
      }
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className='flex flex-col gap-6'>
      {isOfferUnavailable && (
        <Alert variant='destructive'>
          <Lock aria-hidden='true' />
          <AlertTitle>Penawaran tidak dapat dipesan</AlertTitle>
          <AlertDescription>
            {offer.availableStockKg <= 0
              ? 'Stok komoditas untuk penawaran ini sudah habis.'
              : 'Batas waktu pemesanan telah berakhir.'}
          </AlertDescription>
        </Alert>
      )}

      {isNonBuyerUser && (
        <Alert variant='destructive'>
          <AlertCircle aria-hidden='true' />
          <AlertTitle>Akun tidak dapat memesan</AlertTitle>
          <AlertDescription>
            Masuk menggunakan akun Pembeli untuk membuat reservasi panen.
          </AlertDescription>
        </Alert>
      )}

      {priceChangedFromDetail && (
        <Alert>
          <AlertCircle aria-hidden='true' />
          <AlertTitle>Harga penawaran telah diperbarui</AlertTitle>
          <AlertDescription className='flex flex-col gap-3'>
            <span>
              Harga berubah dari{' '}
              <strong className='tabular-nums'>
                {formatPricePerKg(expectedPricePerKg as number)}
              </strong>{' '}
              menjadi <strong className='tabular-nums'>{formatPricePerKg(offer.pricePerKg)}</strong>{' '}
              sesuai jadwal dinamis.
            </span>

            <Field orientation='horizontal' data-invalid={showPriceAckError || undefined}>
              <Checkbox
                id='checkout-price-ack'
                checked={priceConfirmed}
                onCheckedChange={(checked) => {
                  const accepted = Boolean(checked)
                  setPriceConfirmed(accepted)
                  if (accepted) {
                    setAcknowledgedPrice(offer.pricePerKg)
                  }
                }}
              />
              <FieldLabel htmlFor='checkout-price-ack' className='text-sm font-medium'>
                Saya menyetujui harga terbaru {formatPricePerKg(offer.pricePerKg)}
              </FieldLabel>
            </Field>

            {showPriceAckError && (
              <FieldError
                errors={[{ message: 'Centang persetujuan harga terbaru untuk lanjut.' }]}
              />
            )}
          </AlertDescription>
        </Alert>
      )}

      {createOrderMutation.isError && (
        <Alert variant='destructive'>
          <AlertCircle aria-hidden='true' />
          <AlertDescription>{createOrderMutation.error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detail pengambilan mandiri</CardTitle>
          <CardDescription>
            Atur berat pesanan dan pilih slot waktu ambil di lokasi petani.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <Field data-invalid={showWeightError || undefined}>
              <FieldLabel htmlFor='checkout-weight'>Berat pesanan (kg)</FieldLabel>
              <FieldDescription id='checkout-weight-hint'>
                Ketelitian hingga 0,001 kg, tersedia maks. {formatWeightKg(offer.availableStockKg)}.
              </FieldDescription>

              <InputGroup>
                <InputGroupInput
                  ref={weightInputRef}
                  id='checkout-weight'
                  name='quantityKg'
                  type='text'
                  inputMode='decimal'
                  enterKeyHint='next'
                  placeholder='Contoh: 5'
                  value={weightText}
                  onBlur={() => setWeightTouched(true)}
                  onChange={(event) => onWeightTextChange(event.target.value)}
                  aria-describedby={
                    showWeightError
                      ? 'checkout-weight-hint checkout-weight-error'
                      : 'checkout-weight-hint'
                  }
                  aria-invalid={showWeightError || undefined}
                />
                <InputGroupAddon align='inline-end'>
                  <InputGroupText>kg</InputGroupText>
                </InputGroupAddon>
              </InputGroup>

              {presets.length > 0 && (
                <div className='flex flex-wrap items-center gap-1.5 pt-1'>
                  {presets.map((preset) => (
                    <Button
                      key={preset}
                      type='button'
                      variant={parsedWeightKg === preset ? 'secondary' : 'outline'}
                      size='xs'
                      onClick={() => {
                        onWeightTextChange(String(preset))
                        setWeightTouched(true)
                      }}
                      className='rounded-full tabular-nums'
                    >
                      {formatWeightKg(preset)}
                    </Button>
                  ))}
                </div>
              )}

              {showWeightError && (
                <FieldError
                  id='checkout-weight-error'
                  errors={[{ message: weightError as string }]}
                />
              )}
            </Field>

            <FieldSet data-invalid={showSlotError || undefined}>
              <FieldLegend variant='label'>Jadwal pengambilan</FieldLegend>

              {availableSlots.length === 0 ? (
                <p className='text-sm text-destructive'>Belum ada slot pengambilan tersedia.</p>
              ) : availableSlots.length <= 5 ? (
                <RadioGroup
                  value={activeSlotId}
                  onValueChange={(value) => {
                    onSelectedSlotIdChange(String(value))
                    setSlotTouched(true)
                  }}
                >
                  {availableSlots.map((slot) => {
                    const slotInputId = `checkout-slot-${slot.id}`
                    return (
                      <FieldLabel key={slot.id} htmlFor={slotInputId}>
                        <Field orientation='horizontal'>
                          <RadioGroupItem id={slotInputId} value={slot.id} />
                          <FieldContent>
                            <FieldTitle className='text-sm font-medium tabular-nums'>
                              {formatPickupSlotLabel(slot)}
                            </FieldTitle>
                          </FieldContent>
                        </Field>
                      </FieldLabel>
                    )
                  })}
                </RadioGroup>
              ) : (
                <Select
                  value={activeSlotId}
                  onValueChange={(value) => {
                    if (value) {
                      onSelectedSlotIdChange(value)
                      setSlotTouched(true)
                    }
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Pilih slot pengambilan' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {formatPickupSlotLabel(slot)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              {showSlotError && <FieldError errors={[{ message: slotError as string }]} />}
            </FieldSet>

            <Field>
              <FieldLabel htmlFor='checkout-notes'>Catatan untuk petani (opsional)</FieldLabel>
              <Textarea
                id='checkout-notes'
                name='notes'
                rows={2}
                placeholder='Misal: membawa keranjang sendiri atau datang di awal jam slot'
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <CheckoutContactCard
        contactName={effectiveContactName}
        contactPhone={effectiveContactPhone}
        contactNameRef={contactNameRef}
        contactPhoneRef={contactPhoneRef}
        contactErrors={contactErrors}
        showNameError={showNameError}
        showPhoneError={showPhoneError}
        onNameBlur={() => setNameTouched(true)}
        onPhoneBlur={() => setPhoneTouched(true)}
        onNameChange={(value) => {
          setNameTouched(true)
          setContactName(value)
        }}
        onPhoneChange={(value) => {
          setPhoneTouched(true)
          setContactPhone(value)
        }}
      />

      <CheckoutBuyerAddressCard
        isLoggedIn={Boolean(currentUser)}
        organizationName={currentUser?.organization}
        addresses={buyerAddresses}
        selectedAddressId={resolvedAddressId}
        customDraftAddress={customBuyerAddress}
        onSelectAddressId={setSelectedAddressId}
        onSelectCustomAddress={setCustomBuyerAddress}
        onRequireAuth={onRequireAuth}
      />

      <CheckoutTermsCard
        estimatedTotal={
          parsedWeightKg !== null && !weightError
            ? Math.round(parsedWeightKg * offer.pricePerKg)
            : null
        }
        isDisabled={isOfferUnavailable || isNonBuyerUser || availableSlots.length === 0}
        isPending={createOrderMutation.isPending}
        isLoggedIn={Boolean(currentUser)}
      />
    </form>
  )
}
