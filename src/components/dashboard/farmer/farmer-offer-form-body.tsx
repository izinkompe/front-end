'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { AlertCircle } from 'lucide-react'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useCreateFarmerOffer, useUpdateFarmerOffer } from '@/hooks/api/use-farmer-management'
import { mainCategories } from '@/lib/data/categories'
import { createUniqueId } from '@/lib/utils'
import type { FarmerFarm } from '@/types/api/farmer-management'
import { SaveFarmerOfferRequestSchema } from '@/types/api/farmer-management'
import type { CommodityCondition, Offer, ScheduleSlot } from '@/types/api/offers'
import {
  DynamicPriceSection,
  OFFER_CONDITION_OPTIONS,
  ScheduleSlotsEditor,
  toOfferDateInputValue,
  toOfferDateTimeLocalValue,
} from './offer-form-sections'

export function OfferFormBody({
  activeFarms,
  existingOffer,
  copySource,
  isVerified,
}: {
  activeFarms: FarmerFarm[]
  existingOffer?: Offer
  copySource?: Offer
  isVerified: boolean
}) {
  const router = useRouter()
  const isEdit = Boolean(existingOffer)
  const source = existingOffer ?? copySource
  const createOffer = useCreateFarmerOffer()
  const updateOffer = useUpdateFarmerOffer(existingOffer?.id ?? '')
  const activeMutation = isEdit ? updateOffer : createOffer
  const submitStatusRef = useRef<'draft' | 'active'>('draft')
  const [slotError, setSlotError] = useState<string | null>(null)

  const defaultFarmId =
    source?.farmId && activeFarms.some((farm) => farm.id === source.farmId)
      ? source.farmId
      : (activeFarms[0]?.id ?? '')

  const defaultSlots: ScheduleSlot[] = existingOffer?.pickupScheduleSlots?.length
    ? existingOffer.pickupScheduleSlots
    : [
        {
          id: createUniqueId('slot-').slice(0, 13),
          date: toOfferDateInputValue(undefined, 1),
          startTime: '08:00',
          endTime: '11:00',
          isAvailable: true,
        },
      ]

  const form = useForm({
    defaultValues: {
      farmId: defaultFarmId,
      commodityName: copySource
        ? `${copySource.commodityName} (Salinan)`
        : (existingOffer?.commodityName ?? ''),
      category: source?.category ?? mainCategories[0].label,
      condition: (existingOffer?.condition ?? 'surplus') as CommodityCondition,
      conditionNote: existingOffer?.conditionNote ?? '',
      surplusReason: source?.surplusReason ?? '',
      estimatedPortionNote: source?.estimatedPortionNote ?? '',
      harvestDate: existingOffer ? toOfferDateInputValue(existingOffer.harvestDate) : '',
      availableStockKg: existingOffer ? String(existingOffer.availableStockKg) : '',
      pricePerKg: source ? String(source.pricePerKg) : '',
      dynamicEnabled: Boolean(source?.dynamicPriceRule),
      startPrice: source?.dynamicPriceRule ? String(source.dynamicPriceRule.startPrice) : '',
      minPrice: source?.dynamicPriceRule ? String(source.dynamicPriceRule.minPrice) : '',
      dropIntervalHours: source?.dynamicPriceRule
        ? String(source.dynamicPriceRule.dropIntervalHours)
        : '4',
      dropAmount: source?.dynamicPriceRule ? String(source.dynamicPriceRule.dropAmount) : '1000',
      orderDeadline: existingOffer ? toOfferDateTimeLocalValue(existingOffer.orderDeadline) : '',
      pickupScheduleSlots: defaultSlots,
    },
    onSubmit: async ({ value }) => {
      setSlotError(null)
      const parsedStock = Math.round(Number(value.availableStockKg.replace(',', '.')) * 1000) / 1000
      const parsedPrice = Math.round(Number(value.pricePerKg))
      const validSlots = value.pickupScheduleSlots.filter(
        (slot) => slot.date && slot.startTime && slot.endTime && slot.endTime > slot.startTime
      )
      if (validSlots.length === 0) {
        setSlotError('Tambahkan minimal satu slot jadwal dengan jam selesai setelah jam mulai.')
        return
      }

      const dynamicPriceRule = value.dynamicEnabled
        ? {
            startPrice: Number(value.startPrice),
            minPrice: Number(value.minPrice),
            dropIntervalHours: Number(value.dropIntervalHours),
            dropAmount: Number(value.dropAmount),
          }
        : undefined

      const harvestIso = value.harvestDate
        ? new Date(`${value.harvestDate}T06:00:00`).toISOString()
        : ''
      const deadlineIso = value.orderDeadline ? new Date(value.orderDeadline).toISOString() : ''

      const validated = SaveFarmerOfferRequestSchema.safeParse({
        farmId: value.farmId,
        commodityName: value.commodityName.trim(),
        category: value.category,
        condition: value.condition,
        conditionNote: value.conditionNote.trim() || undefined,
        surplusReason: value.surplusReason.trim() || undefined,
        estimatedPortionNote: value.estimatedPortionNote.trim() || undefined,
        harvestDate: harvestIso,
        availableStockKg: Number.isFinite(parsedStock) ? parsedStock : 0,
        pricePerKg: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        dynamicPriceRule,
        orderDeadline: deadlineIso,
        pickupScheduleSlots: validSlots,
        photos: source?.photos,
        status: submitStatusRef.current,
      })

      if (!validated.success) {
        setSlotError(
          validated.error.issues[0]?.message ?? 'Periksa kembali seluruh isian penawaran.'
        )
        return
      }

      if (isEdit) {
        await updateOffer.mutateAsync(validated.data)
      } else {
        await createOffer.mutateAsync(validated.data)
      }
      router.push('/dashboard/penawaran')
    },
  })

  return (
    <Card className='max-w-4xl'>
      <CardHeader>
        <CardTitle>
          {isEdit
            ? 'Sunting penawaran panen'
            : copySource
              ? 'Salin ke draf penawaran baru'
              : 'Buat penawaran panen'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          className='flex flex-col gap-6'
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          {copySource && (
            <Alert>
              <AlertCircle />
              <AlertDescription>
                Isi ulang tanggal panen, kondisi, stok tersedia, dan batas waktu pemesanan sebelum
                menerbitkan.
              </AlertDescription>
            </Alert>
          )}

          {isEdit && (existingOffer?.reservedStockKg ?? 0) > 0 && (
            <Alert>
              <AlertCircle />
              <AlertDescription>
                Perubahan harga atau jadwal hanya berlaku untuk pesanan baru.
              </AlertDescription>
            </Alert>
          )}

          {(activeMutation.isError || slotError) && (
            <Alert variant='destructive'>
              <AlertCircle />
              <AlertDescription>{activeMutation.error?.message ?? slotError}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <form.Field name='farmId'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor='offer-farm-id'>Kebun asal panen</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => {
                        if (val) field.handleChange(val)
                      }}
                    >
                      <SelectTrigger id='offer-farm-id'>
                        <SelectValue placeholder='Pilih kebun aktif' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {activeFarms.map((farm) => (
                            <SelectItem key={farm.id} value={farm.id}>
                              {farm.name} ({farm.areaName})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              <form.Field name='category'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor='offer-category'>Kategori komoditas</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => {
                        if (val) field.handleChange(val)
                      }}
                    >
                      <SelectTrigger id='offer-category'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {mainCategories.map((cat) => (
                            <SelectItem key={cat.slug} value={cat.label}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
            </div>

            <form.Field name='commodityName'>
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor='offer-commodity-name'>Nama komoditas</FieldLabel>
                    <Input
                      id='offer-commodity-name'
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder='Contoh: Tomat Ceri Grade B Segar'
                      maxLength={120}
                      aria-invalid={isInvalid || undefined}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <form.Field name='condition'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor='offer-condition'>Kondisi pangan</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => {
                        if (val) field.handleChange(val as CommodityCondition)
                      }}
                    >
                      <SelectTrigger id='offer-condition'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {OFFER_CONDITION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              <form.Field name='harvestDate'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor='offer-harvest-date'>Tanggal panen</FieldLabel>
                    <Input
                      id='offer-harvest-date'
                      name={field.name}
                      type='date'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            <form.Field name='surplusReason'>
              {(field) => (
                <Field>
                  <FieldLabel htmlFor='offer-surplus-reason'>Alasan surplus panen</FieldLabel>
                  <Textarea
                    id='offer-surplus-reason'
                    name={field.name}
                    rows={2}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder='Contoh: Kelebihan panen harian mitra atau ukuran tidak seragam'
                    maxLength={280}
                  />
                </Field>
              )}
            </form.Field>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <form.Field name='availableStockKg'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor='offer-stock-kg'>Stok tersedia (kg)</FieldLabel>
                    <Input
                      id='offer-stock-kg'
                      name={field.name}
                      type='number'
                      step='0.001'
                      min='0.001'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder='Contoh: 50'
                    />
                    <FieldDescription>Ketelitian hingga 0,001 kg.</FieldDescription>
                  </Field>
                )}
              </form.Field>

              <form.Field name='pricePerKg'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor='offer-price-kg'>Harga per kg (IDR)</FieldLabel>
                    <Input
                      id='offer-price-kg'
                      name={field.name}
                      type='number'
                      min='100'
                      step='100'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder='Contoh: 12000'
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name='orderDeadline'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor='offer-deadline'>Batas waktu pemesanan</FieldLabel>
                    <Input
                      id='offer-deadline'
                      name={field.name}
                      type='datetime-local'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            <form.Field name='estimatedPortionNote'>
              {(field) => (
                <Field>
                  <FieldLabel htmlFor='offer-portion-note'>
                    Catatan estimasi isi per kg (opsional)
                  </FieldLabel>
                  <Input
                    id='offer-portion-note'
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder='Contoh: Estimasi ±6–8 buah ukuran campur per kg'
                    maxLength={160}
                  />
                  <FieldDescription>Tidak mengubah satuan transaksi kg.</FieldDescription>
                </Field>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values}>
              {(values) => (
                <DynamicPriceSection
                  enabled={values.dynamicEnabled}
                  startPrice={values.startPrice}
                  minPrice={values.minPrice}
                  dropIntervalHours={values.dropIntervalHours}
                  dropAmount={values.dropAmount}
                  onToggle={(checked) => form.setFieldValue('dynamicEnabled', checked)}
                  onStartPriceChange={(next) => form.setFieldValue('startPrice', next)}
                  onMinPriceChange={(next) => form.setFieldValue('minPrice', next)}
                  onIntervalChange={(next) => form.setFieldValue('dropIntervalHours', next)}
                  onAmountChange={(next) => form.setFieldValue('dropAmount', next)}
                />
              )}
            </form.Subscribe>

            <form.Field name='pickupScheduleSlots'>
              {(field) => (
                <ScheduleSlotsEditor
                  slots={field.state.value}
                  onChange={field.handleChange}
                  defaultDate={toOfferDateInputValue(undefined, 1)}
                />
              )}
            </form.Field>
          </FieldGroup>

          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              nativeButton={false}
              render={<Link href='/dashboard/penawaran' />}
            >
              Batal
            </Button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <>
                  <Button
                    type='submit'
                    variant='outline'
                    disabled={isSubmitting || activeMutation.isPending}
                    onClick={() => {
                      submitStatusRef.current = 'draft'
                    }}
                  >
                    <span>Simpan sebagai draf</span>
                  </Button>
                  <Button
                    type='submit'
                    disabled={!isVerified || isSubmitting || activeMutation.isPending}
                    onClick={() => {
                      submitStatusRef.current = 'active'
                    }}
                  >
                    {(isSubmitting || activeMutation.isPending) && (
                      <Spinner data-icon='inline-start' />
                    )}
                    <span>Terbitkan penawaran</span>
                  </Button>
                </>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
