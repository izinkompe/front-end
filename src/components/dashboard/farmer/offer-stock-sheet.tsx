'use client'

import { useForm } from '@tanstack/react-form'
import { AlertCircle } from 'lucide-react'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useAdjustFarmerOfferStock } from '@/hooks/api/use-farmer-management'
import { AdjustOfferStockRequestSchema } from '@/types/api/farmer-management'
import type { CommodityCondition, Offer } from '@/types/api/offers'

const CONDITION_OPTIONS: ReadonlyArray<{ value: CommodityCondition; label: string }> = [
  { value: 'surplus', label: 'Surplus panen' },
  { value: 'grade_b', label: 'Grade B segar' },
  { value: 'imperfect_shape', label: 'Bentuk tidak seragam' },
  { value: 'ripe_urgent', label: 'Matang segera olah' },
]

interface OfferStockSheetProps {
  offer: Offer | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

function OfferStockForm({
  offer,
  onSaved,
  onCancel,
}: {
  offer: Offer
  onSaved: () => void
  onCancel: () => void
}) {
  const adjustStock = useAdjustFarmerOfferStock(offer.id)

  const form = useForm({
    defaultValues: {
      availableStockKg: String(offer.availableStockKg),
      condition: offer.condition,
      conditionNote: offer.conditionNote ?? '',
      closeOffer: false,
    },
    validators: {
      onSubmit: ({ value }) => {
        const parsedStock = Number(value.availableStockKg.replace(',', '.'))
        const result = AdjustOfferStockRequestSchema.safeParse({
          availableStockKg: Number.isFinite(parsedStock) ? parsedStock : -1,
          condition: value.condition,
          conditionNote: value.conditionNote.trim() || undefined,
          closeOffer: value.closeOffer,
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
      const parsedStock = Math.round(Number(value.availableStockKg.replace(',', '.')) * 1000) / 1000
      await adjustStock.mutateAsync({
        availableStockKg: parsedStock,
        condition: value.condition,
        conditionNote: value.conditionNote.trim() || undefined,
        closeOffer: value.closeOffer,
      })
      onSaved()
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
        <Card size='sm' className='bg-muted/40'>
          <CardContent className='flex flex-col gap-1'>
            <p className='text-sm font-semibold text-foreground'>{offer.commodityName}</p>
            <p className='font-mono text-meta text-muted-foreground tabular-nums'>
              Direservasi: {offer.reservedStockKg.toLocaleString('id-ID')} kg · Terjual:{' '}
              {offer.soldStockKg.toLocaleString('id-ID')} kg
            </p>
          </CardContent>
        </Card>

        {offer.reservedStockKg > 0 && (
          <Alert>
            <AlertCircle />
            <AlertDescription>
              Terdapat {offer.reservedStockKg.toLocaleString('id-ID')} kg dalam reservasi pesanan
              aktif. Koreksi hanya mengubah stok yang belum dipesan.
            </AlertDescription>
          </Alert>
        )}

        {adjustStock.isError && (
          <Alert variant='destructive'>
            <AlertCircle />
            <AlertDescription>{adjustStock.error.message}</AlertDescription>
          </Alert>
        )}

        <FieldGroup>
          <form.Field name='availableStockKg'>
            {(field) => {
              const errors = getFieldErrorMessages(field.state.meta.errors)
              const isInvalid = field.state.meta.isTouched && errors.length > 0
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor='adjust-stock-kg'>Stok tersedia (kg)</FieldLabel>
                  <Input
                    id='adjust-stock-kg'
                    name={field.name}
                    type='number'
                    step='0.001'
                    min='0'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid || undefined}
                  />
                  <FieldDescription>Ketelitian hingga 0,001 kg.</FieldDescription>
                  {isInvalid && <FieldError errors={errors} />}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name='condition'>
            {(field) => (
              <Field>
                <FieldLabel htmlFor='adjust-condition'>Kondisi komoditas</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    if (value) field.handleChange(value as CommodityCondition)
                  }}
                >
                  <SelectTrigger id='adjust-condition'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {CONDITION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          </form.Field>

          <form.Field name='conditionNote'>
            {(field) => {
              const errors = getFieldErrorMessages(field.state.meta.errors)
              const isInvalid = field.state.meta.isTouched && errors.length > 0
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor='adjust-condition-note'>Catatan perubahan kondisi</FieldLabel>
                  <Textarea
                    id='adjust-condition-note'
                    name={field.name}
                    rows={2}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder='Contoh: Sortir ulang sore hari, sebagian buah semakin matang'
                    maxLength={240}
                    aria-invalid={isInvalid || undefined}
                  />
                  {isInvalid && <FieldError errors={errors} />}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name='closeOffer'>
            {(field) => (
              <Field orientation='horizontal'>
                <Checkbox
                  id='adjust-close-offer'
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
                />
                <FieldLabel htmlFor='adjust-close-offer'>
                  Tutup penawaran lebih awal karena kondisi menurun
                </FieldLabel>
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </div>

      <SheetFooter className='border-t border-border px-0 pt-4 pb-0'>
        <div className='flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Batal
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type='submit' disabled={isSubmitting || adjustStock.isPending}>
                {(isSubmitting || adjustStock.isPending) && <Spinner data-icon='inline-start' />}
                <span>Simpan koreksi stok</span>
              </Button>
            )}
          </form.Subscribe>
        </div>
      </SheetFooter>
    </form>
  )
}

export function OfferStockSheet({ offer, onOpenChange, onSaved }: OfferStockSheetProps) {
  return (
    <Sheet open={Boolean(offer)} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Koreksi stok dan kondisi</SheetTitle>
        </SheetHeader>
        {offer && (
          <OfferStockForm
            key={offer.id}
            offer={offer}
            onSaved={() => {
              onSaved()
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
