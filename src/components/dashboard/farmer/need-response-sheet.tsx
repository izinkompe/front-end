'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Trash2 } from 'lucide-react'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useFarmerOffers } from '@/hooks/api/use-farmer-management'
import {
  useCreateNeedResponse,
  useDeleteNeedResponse,
  useUpdateNeedResponse,
} from '@/hooks/api/use-needs-board'
import { getJakartaDate, getRemainingNeedKg } from '@/lib/data/needs-board-helpers'
import {
  FarmerNeedResponseRequestSchema,
  type NeedRequest,
  type NeedResponse,
} from '@/types/api/needs-board'
import type { Offer } from '@/types/api/offers'

interface NeedResponseSheetProps {
  need: NeedRequest | null
  existingResponse?: NeedResponse
  isVerified: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (message: string) => void
}

function NeedResponseForm({
  need,
  existingResponse,
  activeOffers,
  isVerified,
  onSaved,
  onCancel,
}: {
  need: NeedRequest
  existingResponse?: NeedResponse
  activeOffers: Offer[]
  isVerified: boolean
  onSaved: (message: string) => void
  onCancel: () => void
}) {
  const createResp = useCreateNeedResponse(need.id)
  const updateResp = useUpdateNeedResponse(need.id, existingResponse?.id ?? '')
  const deleteResp = useDeleteNeedResponse(need.id)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const activeMutation = existingResponse ? updateResp : createResp
  const today = getJakartaDate()
  const initialOffer =
    activeOffers.find((offer) => offer.id === existingResponse?.offerId) ?? activeOffers[0]

  const form = useForm({
    defaultValues: {
      offerId: initialOffer?.id ?? '',
      offeredQuantityKg: existingResponse
        ? String(existingResponse.offeredQuantityKg)
        : initialOffer
          ? String(Math.min(getRemainingNeedKg(need), initialOffer.availableStockKg))
          : '',
      offeredPricePerKg: existingResponse
        ? String(existingResponse.offeredPricePerKg)
        : initialOffer
          ? String(initialOffer.pricePerKg)
          : '',
      availableDate: existingResponse?.availableDate ?? today,
      message: existingResponse?.message ?? '',
    },
    validators: {
      onSubmit: ({ value }) => {
        const parsedQty =
          Math.round(Number(value.offeredQuantityKg.replace(',', '.')) * 1000) / 1000
        const parsedPrice = Math.round(Number(value.offeredPricePerKg))
        const result = FarmerNeedResponseRequestSchema.safeParse({
          offerId: value.offerId,
          offeredQuantityKg: Number.isFinite(parsedQty) ? parsedQty : 0,
          offeredPricePerKg: Number.isFinite(parsedPrice) ? parsedPrice : 0,
          availableDate: value.availableDate,
          message: value.message.trim() || undefined,
        })
        if (result.success) return undefined

        const fieldErrors: Record<string, string> = {}
        for (const issue of result.error.issues) {
          const path = issue.path[0]
          if (path && !fieldErrors[String(path)]) {
            fieldErrors[String(path)] = issue.message
          }
        }
        return { fields: fieldErrors }
      },
    },
    onSubmit: async ({ value }) => {
      const parsedQty = Math.round(Number(value.offeredQuantityKg.replace(',', '.')) * 1000) / 1000
      const parsedPrice = Math.round(Number(value.offeredPricePerKg))
      const payload = {
        offerId: value.offerId,
        offeredQuantityKg: parsedQty,
        offeredPricePerKg: parsedPrice,
        availableDate: value.availableDate,
        message: value.message.trim() || undefined,
      }
      if (existingResponse) {
        await updateResp.mutateAsync(payload)
        onSaved('Tanggapan Papan Kebutuhan diperbarui.')
      } else {
        await createResp.mutateAsync(payload)
        onSaved('Tanggapan berhasil dikirim ke pembeli.')
      }
    },
  })

  return (
    <form
      noValidate
      className='flex flex-1 flex-col justify-between gap-6 p-4'
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div className='flex flex-col gap-4'>
        <Card size='sm' className='bg-muted/30'>
          <CardContent className='flex flex-col gap-1 text-sm'>
            <p className='font-semibold text-foreground'>{need.commodityName}</p>
            <p className='text-meta text-muted-foreground'>
              {need.organization || need.buyerName} · {need.targetArea}
            </p>
            <p className='pt-1 font-mono text-meta text-foreground tabular-nums'>
              Sisa kebutuhan: {getRemainingNeedKg(need).toLocaleString('id-ID')} kg
              {need.maxPricePerKg
                ? ` · Maks Rp ${need.maxPricePerKg.toLocaleString('id-ID')}/kg`
                : ''}
            </p>
            {need.notes && <p className='pt-1 text-sm text-muted-foreground'>{need.notes}</p>}
          </CardContent>
        </Card>

        {!isVerified && (
          <Alert>
            <AlertCircle />
            <AlertDescription>
              Akun Anda masih menunggu verifikasi Admin sehingga pengiriman tanggapan terkunci.
            </AlertDescription>
          </Alert>
        )}

        {activeOffers.length === 0 ? (
          <Alert>
            <AlertCircle />
            <AlertDescription className='flex flex-col gap-2'>
              <span>Anda belum memiliki penawaran aktif dengan stok tersedia untuk ditautkan.</span>
              <Button
                size='sm'
                variant='outline'
                className='self-start'
                nativeButton={false}
                render={<Link href='/dashboard/penawaran/baru' />}
              >
                Buat penawaran baru
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {activeMutation.isError && (
              <Alert variant='destructive'>
                <AlertCircle />
                <AlertDescription>{activeMutation.error.message}</AlertDescription>
              </Alert>
            )}

            <FieldGroup>
              <form.Field name='offerId'>
                {(field) => {
                  const errors = getFieldErrorMessages(field.state.meta.errors)
                  const isInvalid = field.state.meta.isTouched && errors.length > 0
                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor='resp-offer-id'>Tautkan ke penawaran aktif</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(nextId) => {
                          if (!nextId) return
                          field.handleChange(nextId)
                          const chosen = activeOffers.find((o) => o.id === nextId)
                          if (chosen) {
                            form.setFieldValue('offeredPricePerKg', String(chosen.pricePerKg))
                            form.setFieldValue(
                              'offeredQuantityKg',
                              String(Math.min(getRemainingNeedKg(need), chosen.availableStockKg))
                            )
                          }
                        }}
                      >
                        <SelectTrigger id='resp-offer-id' aria-invalid={isInvalid || undefined}>
                          <SelectValue placeholder='Pilih penawaran aktif' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {activeOffers.map((offer) => (
                              <SelectItem key={offer.id} value={offer.id}>
                                {offer.commodityName} (sisa {offer.availableStockKg} kg)
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {isInvalid && <FieldError errors={errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <form.Field name='offeredQuantityKg'>
                  {(field) => {
                    const errors = getFieldErrorMessages(field.state.meta.errors)
                    const isInvalid = field.state.meta.isTouched && errors.length > 0
                    return (
                      <Field data-invalid={isInvalid || undefined}>
                        <FieldLabel htmlFor='resp-qty'>Jumlah ditawarkan (kg)</FieldLabel>
                        <Input
                          id='resp-qty'
                          type='number'
                          step='0.001'
                          min='0.001'
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid || undefined}
                        />
                        {isInvalid && <FieldError errors={errors} />}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name='offeredPricePerKg'>
                  {(field) => {
                    const errors = getFieldErrorMessages(field.state.meta.errors)
                    const isInvalid = field.state.meta.isTouched && errors.length > 0
                    return (
                      <Field data-invalid={isInvalid || undefined}>
                        <FieldLabel htmlFor='resp-price'>Harga per kg (IDR)</FieldLabel>
                        <Input
                          id='resp-price'
                          type='number'
                          min='100'
                          step='100'
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid || undefined}
                        />
                        {isInvalid && <FieldError errors={errors} />}
                      </Field>
                    )
                  }}
                </form.Field>
              </div>

              <form.Field name='availableDate'>
                {(field) => {
                  const errors = getFieldErrorMessages(field.state.meta.errors)
                  const isInvalid = field.state.meta.isTouched && errors.length > 0
                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor='resp-date'>Tanggal siap diambil</FieldLabel>
                      <Input
                        id='resp-date'
                        type='date'
                        min={today}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid || undefined}
                      />
                      {isInvalid && <FieldError errors={errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name='message'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor='resp-msg'>Catatan untuk pembeli (opsional)</FieldLabel>
                    <Textarea
                      id='resp-msg'
                      rows={2}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder='Contoh: Panen tersedia pagi hari di pos sortir kebun'
                      maxLength={300}
                    />
                    <FieldDescription>Maksimal 300 karakter.</FieldDescription>
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </>
        )}
      </div>

      <SheetFooter className='border-t border-border px-0 pt-4 pb-0'>
        <div className='flex w-full flex-wrap items-center justify-between gap-2'>
          {existingResponse ? (
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger render={<Button type='button' variant='destructive' size='sm' />}>
                <Trash2 data-icon='inline-start' aria-hidden='true' />
                <span>Tarik tanggapan</span>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tarik tanggapan ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Pembeli tidak lagi melihat tanggapan Anda untuk permintaan ini.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Kembali</AlertDialogCancel>
                  <AlertDialogAction
                    variant='destructive'
                    disabled={deleteResp.isPending}
                    onClick={() =>
                      deleteResp.mutate(existingResponse.id, {
                        onSuccess: () => {
                          setDeleteOpen(false)
                          onSaved('Tanggapan berhasil ditarik.')
                        },
                      })
                    }
                  >
                    {deleteResp.isPending && <Spinner data-icon='inline-start' />}
                    <span>Tarik tanggapan</span>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <span />
          )}

          <div className='flex flex-col-reverse gap-2 sm:flex-row'>
            <Button type='button' variant='outline' onClick={onCancel}>
              Batal
            </Button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type='submit'
                  disabled={
                    !isVerified ||
                    activeOffers.length === 0 ||
                    isSubmitting ||
                    activeMutation.isPending
                  }
                >
                  {(isSubmitting || activeMutation.isPending) && (
                    <Spinner data-icon='inline-start' />
                  )}
                  <span>{existingResponse ? 'Perbarui tanggapan' : 'Kirim tanggapan'}</span>
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </SheetFooter>
    </form>
  )
}

export function NeedResponseSheet({
  need,
  existingResponse,
  isVerified,
  onOpenChange,
  onSaved,
}: NeedResponseSheetProps) {
  const { data: offers = [] } = useFarmerOffers()
  const activeOffers = useMemo(
    () => offers.filter((offer) => offer.status === 'active' && offer.availableStockKg >= 0.001),
    [offers]
  )

  return (
    <Sheet open={Boolean(need)} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>
            {existingResponse ? 'Ubah tanggapan kebutuhan' : 'Tanggapi permintaan pembeli'}
          </SheetTitle>
        </SheetHeader>
        {need && (
          <NeedResponseForm
            key={`${need.id}-${existingResponse?.id ?? 'new'}`}
            need={need}
            existingResponse={existingResponse}
            activeOffers={activeOffers}
            isVerified={isVerified}
            onSaved={(msg) => {
              onSaved(msg)
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
