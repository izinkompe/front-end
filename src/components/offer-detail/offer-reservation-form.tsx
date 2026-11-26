'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Clock, Lock, MapPin, ShieldCheck, Truck } from 'lucide-react'
import {
  formatPlainRupiah,
  formatPricePerKg,
  formatWeightKg,
  getDynamicPriceSummary,
} from '@/components/home/offer-card-helpers'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useCreateOrder } from '@/hooks/api/use-orders'
import {
  formatDateTimeId,
  formatPickupSlotLabel,
  getWeightPresetsKg,
  parseWeightInputKg,
  validateOrderWeightKg,
} from '@/lib/data/offer-detail-helpers'
import { cn } from '@/lib/utils'
import type { User } from '@/types/api/auth'
import type { Offer } from '@/types/api/offers'
import type { Order } from '@/types/api/orders'

interface OfferReservationFormProps {
  offer: Offer
  isExpired: boolean
  currentUser: User | null | undefined
  onRequireAuth: () => void
  onOrderCreated: (order: Order) => void
  idPrefix?: string
}

export function OfferReservationForm({
  offer,
  isExpired,
  currentUser,
  onRequireAuth,
  onOrderCreated,
  idPrefix = 'offer-order',
}: OfferReservationFormProps) {
  const createOrderMutation = useCreateOrder()
  const availableSlots = offer.pickupScheduleSlots.filter((slot) => slot.isAvailable !== false)
  const defaultSlotId = availableSlots[0]?.id ?? ''
  const presets = getWeightPresetsKg(offer.availableStockKg)

  const [weightText, setWeightText] = useState(() => {
    if (offer.availableStockKg >= 5) return '5'
    if (offer.availableStockKg >= 1) return '1'
    return offer.availableStockKg > 0 ? String(offer.availableStockKg) : ''
  })
  const [selectedSlotId, setSelectedSlotId] = useState(defaultSlotId)
  const [notes, setNotes] = useState('')
  const [weightTouched, setWeightTouched] = useState(false)
  const [slotTouched, setSlotTouched] = useState(false)

  const activeSlotId = availableSlots.some((slot) => slot.id === selectedSlotId)
    ? selectedSlotId
    : defaultSlotId

  const parsedWeightKg = parseWeightInputKg(weightText)
  const weightError = validateOrderWeightKg(parsedWeightKg, offer.availableStockKg)
  const slotError =
    availableSlots.length > 0 && !activeSlotId ? 'Pilih salah satu jadwal pengambilan.' : null

  const isOfferClosed = isExpired || offer.status !== 'active' || offer.availableStockKg <= 0
  const isNonBuyerUser = Boolean(currentUser && currentUser.role !== 'buyer')
  const priceSummary = getDynamicPriceSummary(offer.pricePerKg, offer.dynamicPriceRule)

  const estimatedTotal =
    parsedWeightKg !== null && !weightError ? Math.round(parsedWeightKg * offer.pricePerKg) : null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWeightTouched(true)
    setSlotTouched(true)

    if (isOfferClosed) return

    if (!currentUser) {
      onRequireAuth()
      return
    }

    if (currentUser.role !== 'buyer') {
      return
    }

    if (weightError || parsedWeightKg === null || slotError || !activeSlotId) {
      return
    }

    const created = await createOrderMutation.mutateAsync({
      offerId: offer.id,
      quantityKg: parsedWeightKg,
      scheduleSlotId: activeSlotId,
      notes: notes.trim() || undefined,
    })

    onOrderCreated(created)
  }

  const weightInputId = `${idPrefix}-weight`
  const notesInputId = `${idPrefix}-notes`
  const showWeightError = weightTouched && Boolean(weightError)
  const showSlotError = slotTouched && Boolean(slotError)

  return (
    <form noValidate onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <div className='flex items-baseline justify-between gap-3'>
        <div className='flex flex-col gap-0.5'>
          {priceSummary.hasDropped && priceSummary.originalPriceFormatted && (
            <span className='text-sm text-muted-foreground line-through tabular-nums'>
              {priceSummary.originalPriceFormatted}
            </span>
          )}
          <p
            className={cn(
              'text-2xl leading-tight font-bold tabular-nums',
              priceSummary.hasDropped ? 'text-destructive' : 'text-primary'
            )}
          >
            {formatPricePerKg(offer.pricePerKg)}
          </p>
        </div>

        <p
          className={cn(
            'text-sm font-semibold tabular-nums',
            offer.availableStockKg <= 0
              ? 'text-destructive'
              : offer.availableStockKg <= 35
                ? 'text-destructive'
                : 'text-foreground'
          )}
        >
          {offer.availableStockKg > 0
            ? `Sisa ${formatWeightKg(offer.availableStockKg)}`
            : 'Stok habis'}
        </p>
      </div>

      {isOfferClosed ? (
        <Alert className='border-border bg-muted/50 text-foreground'>
          <Lock aria-hidden='true' />
          <AlertTitle>Pemesanan tidak tersedia</AlertTitle>
          <AlertDescription>
            {offer.availableStockKg <= 0
              ? 'Stok panen untuk penawaran ini sudah habis terpesan.'
              : 'Batas waktu pemesanan telah berakhir.'}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {isNonBuyerUser && (
            <Alert variant='destructive'>
              <AlertCircle aria-hidden='true' />
              <AlertTitle>Akun tidak dapat memesan</AlertTitle>
              <AlertDescription>
                Masuk menggunakan akun Pembeli untuk membuat reservasi panen.
              </AlertDescription>
            </Alert>
          )}

          {createOrderMutation.isError && (
            <Alert variant='destructive'>
              <AlertCircle aria-hidden='true' />
              <AlertDescription>{createOrderMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <FieldGroup className='gap-4'>
            <Field data-invalid={showWeightError || undefined}>
              <FieldLabel htmlFor={weightInputId}>Berat pesanan (kg)</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={weightInputId}
                  type='text'
                  inputMode='decimal'
                  placeholder='Contoh: 5'
                  value={weightText}
                  onBlur={() => setWeightTouched(true)}
                  onChange={(event) => setWeightText(event.target.value)}
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
                        setWeightText(String(preset))
                        setWeightTouched(true)
                      }}
                      className='rounded-full tabular-nums'
                    >
                      {formatWeightKg(preset)}
                    </Button>
                  ))}
                </div>
              )}

              {showWeightError ? (
                <FieldError errors={[{ message: weightError as string }]} />
              ) : (
                <FieldDescription>
                  Ketelitian hingga 0,001 kg, maks. {formatWeightKg(offer.availableStockKg)}.
                </FieldDescription>
              )}
            </Field>

            <Field data-invalid={showSlotError || undefined}>
              <FieldLabel>Jadwal pengambilan</FieldLabel>
              {availableSlots.length === 0 ? (
                <p className='text-sm text-destructive'>Belum ada slot pengambilan tersedia.</p>
              ) : availableSlots.length <= 5 ? (
                <ToggleGroup
                  variant='outline'
                  spacing={2}
                  value={activeSlotId ? [activeSlotId] : []}
                  onValueChange={(nextValues) => {
                    if (nextValues[0]) {
                      setSelectedSlotId(nextValues[0])
                      setSlotTouched(true)
                    }
                  }}
                  aria-label='Pilih jadwal pengambilan'
                  className='flex w-full flex-col items-stretch gap-2'
                >
                  {availableSlots.map((slot) => (
                    <ToggleGroupItem
                      key={slot.id}
                      value={slot.id}
                      className='min-h-11 w-full justify-start rounded-lg border border-border bg-background px-3.5 py-2 text-left text-sm font-medium text-foreground tabular-nums aria-pressed:border-primary aria-pressed:bg-primary/8 aria-pressed:text-foreground'
                    >
                      {formatPickupSlotLabel(slot)}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              ) : (
                <Select
                  value={activeSlotId}
                  onValueChange={(value) => {
                    if (value) {
                      setSelectedSlotId(value)
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
            </Field>

            <details className='group'>
              <summary className='cursor-pointer text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground'>
                Tambah catatan pengambilan (opsional)
              </summary>
              <Field className='mt-2.5'>
                <FieldLabel htmlFor={notesInputId}>Catatan pengambilan</FieldLabel>
                <Textarea
                  id={notesInputId}
                  rows={2}
                  placeholder='Misal: bawa keranjang atau datang awal slot'
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </Field>
            </details>
          </FieldGroup>

          <div className='flex items-baseline justify-between gap-2 rounded-xl bg-muted/60 px-4 py-2.5'>
            <span className='text-sm font-medium text-muted-foreground'>Estimasi total</span>
            <span className='text-lg font-bold text-foreground tabular-nums'>
              {estimatedTotal !== null ? formatPlainRupiah(estimatedTotal) : '—'}
            </span>
          </div>

          <Button
            type='submit'
            size='lg'
            disabled={
              createOrderMutation.isPending || isNonBuyerUser || availableSlots.length === 0
            }
            className='w-full'
          >
            {createOrderMutation.isPending && <Spinner data-icon='inline-start' />}
            <span>
              {createOrderMutation.isPending
                ? 'Menyimpan reservasi...'
                : currentUser
                  ? 'Pesan dan reservasi stok'
                  : 'Masuk untuk memesan'}
            </span>
          </Button>
        </>
      )}

      <ul className='flex flex-col gap-1.5 text-sm text-muted-foreground'>
        <li className='flex items-start gap-2.5'>
          <Truck className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
          <span>Ambil mandiri di lokasi petani tanpa biaya kirim</span>
        </li>
        <li className='flex items-start gap-2.5'>
          <Clock className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
          <span>Tenggat unggah bukti transfer 30 menit setelah pesan</span>
        </li>
        <li className='flex items-start gap-2.5'>
          <ShieldCheck className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
          <span>Alamat lengkap terbuka setelah reservasi dibuat</span>
        </li>
      </ul>
    </form>
  )
}

interface OfferOrderSuccessDialogProps {
  order: Order | null
  onOpenChange: (open: boolean) => void
}

export function OfferOrderSuccessDialog({ order, onOpenChange }: OfferOrderSuccessDialogProps) {
  return (
    <Dialog open={Boolean(order)} onOpenChange={onOpenChange}>
      <DialogContent className='gap-5 p-6 sm:max-w-lg'>
        <DialogHeader className='gap-1.5 pr-10'>
          <div className='flex items-center gap-2 text-primary'>
            <CheckCircle2 className='size-5 shrink-0' aria-hidden='true' />
            <DialogTitle>Reservasi stok dibuat</DialogTitle>
          </div>
          <DialogDescription>
            Stok sudah dikunci untuk pesanan Anda. Lanjutkan transfer manual sebelum tenggat bayar
            berakhir.
          </DialogDescription>
        </DialogHeader>

        {order && (
          <dl className='grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm'>
            <div className='flex items-baseline justify-between gap-2'>
              <dt className='text-muted-foreground'>ID pesanan</dt>
              <dd className='font-mono font-medium text-foreground'>{order.id}</dd>
            </div>
            <div className='flex items-baseline justify-between gap-2'>
              <dt className='text-muted-foreground'>Komoditas</dt>
              <dd className='text-right font-medium text-foreground'>
                {order.commodityName} ({formatWeightKg(order.quantityKg)})
              </dd>
            </div>
            <div className='flex items-baseline justify-between gap-2'>
              <dt className='text-muted-foreground'>Total tagihan</dt>
              <dd className='text-base font-bold text-primary tabular-nums'>
                {formatPlainRupiah(order.totalPrice)}
              </dd>
            </div>
            <div className='flex items-baseline justify-between gap-2'>
              <dt className='text-muted-foreground'>Tenggat bayar</dt>
              <dd className='font-medium text-destructive tabular-nums'>
                {formatDateTimeId(order.paymentDeadline)}
              </dd>
            </div>
            <div className='flex items-baseline justify-between gap-2'>
              <dt className='text-muted-foreground'>Jadwal ambil</dt>
              <dd className='text-right font-medium text-foreground tabular-nums'>
                {formatPickupSlotLabel(order.scheduleSlot)}
              </dd>
            </div>
            <div className='flex flex-col gap-1 pt-1'>
              <dt className='flex items-center gap-1.5 text-muted-foreground'>
                <MapPin className='size-4 text-primary' aria-hidden='true' />
                <span>Alamat lengkap pengambilan</span>
              </dt>
              <dd className='font-medium text-foreground'>{order.pickupLocation.address}</dd>
            </div>
          </dl>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button nativeButton={false} render={<Link href='/pasar' />}>
            Kembali ke katalog
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
