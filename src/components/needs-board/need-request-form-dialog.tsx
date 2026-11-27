'use client'

import { useId, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Input } from '@/components/ui/input'
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
import { useCreateNeedRequest } from '@/hooks/api/use-needs-board'
import { mainCategories } from '@/lib/data/categories'
import { getJakartaDate } from '@/lib/data/needs-board-helpers'
import { parseWeightInputKg } from '@/lib/data/offer-detail-helpers'
import { CreateNeedRequestSchema } from '@/types/api/needs-board'

export function NeedRequestFormDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (needId: string) => void
}) {
  const id = useId()
  const today = getJakartaDate()
  const create = useCreateNeedRequest()

  const commodityRef = useRef<HTMLInputElement | null>(null)
  const weightRef = useRef<HTMLInputElement | null>(null)
  const priceRef = useRef<HTMLInputElement | null>(null)
  const dateRef = useRef<HTMLInputElement | null>(null)
  const areaRef = useRef<HTMLInputElement | null>(null)

  const form = useForm({
    defaultValues: {
      commodityName: '',
      category: '',
      weightText: '',
      maxPriceText: '',
      targetDate: '',
      targetArea: '',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      if (create.isPending) return

      const parsedWeight = parseWeightInputKg(value.weightText)
      const parsedPrice = value.maxPriceText.trim()
        ? Number(value.maxPriceText.replace(/\D/g, ''))
        : undefined

      if (value.commodityName.trim().length < 2 || value.commodityName.trim().length > 100) {
        commodityRef.current?.focus()
        return
      }
      if (!value.category) {
        return
      }
      if (parsedWeight === null || parsedWeight < 0.001 || parsedWeight > 100_000) {
        weightRef.current?.focus()
        return
      }
      if (
        value.maxPriceText.trim() !== '' &&
        (!parsedPrice ||
          !Number.isInteger(parsedPrice) ||
          parsedPrice < 1 ||
          parsedPrice > 1_000_000_000)
      ) {
        priceRef.current?.focus()
        return
      }
      if (!value.targetDate || value.targetDate < today) {
        dateRef.current?.focus()
        return
      }
      if (value.targetArea.trim().length < 3 || value.targetArea.trim().length > 100) {
        areaRef.current?.focus()
        return
      }

      const parsed = CreateNeedRequestSchema.safeParse({
        commodityName: value.commodityName.trim(),
        category: value.category,
        neededQuantityKg: parsedWeight,
        maxPricePerKg: parsedPrice,
        targetDate: value.targetDate,
        targetArea: value.targetArea.trim(),
        notes: value.notes.trim() || undefined,
      })

      if (!parsed.success) {
        return
      }

      create.mutate(parsed.data, {
        onSuccess: (need) => {
          form.reset()
          onOpenChange(false)
          onCreated(need.id)
        },
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg'>
        <DialogHeader className='pr-8'>
          <DialogTitle>Pasang kebutuhan pangan</DialogTitle>
          <DialogDescription>
            Publikasikan kebutuhan komoditas Anda agar petani sekitar dapat mengajukan penawaran.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
          className='flex flex-col gap-4'
        >
          <FieldGroup>
            <form.Field
              name='commodityName'
              validators={{
                onChange: ({ value }) => {
                  const trimmed = value.trim()
                  if (trimmed.length < 2) return 'Nama komoditas minimal 2 karakter.'
                  if (trimmed.length > 100) return 'Nama komoditas maksimal 100 karakter.'
                  return undefined
                },
              }}
            >
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={id + '-commodity'}>Komoditas</FieldLabel>
                    <Input
                      ref={commodityRef}
                      id={id + '-commodity'}
                      name={field.name}
                      maxLength={100}
                      placeholder='Misal: Tomat Merah, Beras IR64'
                      value={field.state.value}
                      aria-invalid={isInvalid ? 'true' : 'false'}
                      aria-describedby={isInvalid ? `${id}-commodity-error` : undefined}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {isInvalid && <FieldError id={id + '-commodity-error'} errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field
              name='category'
              validators={{
                onChange: ({ value }) => (!value ? 'Pilih kategori komoditas.' : undefined),
              }}
            >
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={id + '-category'}>Kategori</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                      name={field.name}
                    >
                      <SelectTrigger
                        id={id + '-category'}
                        className='w-full'
                        aria-invalid={isInvalid ? 'true' : 'false'}
                        aria-describedby={isInvalid ? `${id}-category-error` : undefined}
                      >
                        <SelectValue placeholder='Pilih kategori'>
                          {mainCategories.find((item) => item.slug === field.state.value)?.label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {mainCategories.map((item) => (
                            <SelectItem key={item.slug} value={item.slug}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError id={id + '-category-error'} errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <div className='grid gap-4 sm:grid-cols-2'>
              <form.Field
                name='weightText'
                validators={{
                  onChange: ({ value }) => {
                    const parsedWeight = parseWeightInputKg(value)
                    return parsedWeight === null || parsedWeight < 0.001 || parsedWeight > 100_000
                      ? 'Masukkan berat antara 0,001 hingga 100.000 kg (maks. 3 angka desimal).'
                      : undefined
                  },
                }}
              >
                {(field) => {
                  const errors = getFieldErrorMessages(field.state.meta.errors)
                  const isInvalid = field.state.meta.isTouched && errors.length > 0
                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor={id + '-weight'}>Berat dibutuhkan</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          ref={weightRef}
                          id={id + '-weight'}
                          name={field.name}
                          inputMode='decimal'
                          maxLength={10}
                          placeholder='Misal: 25'
                          value={field.state.value}
                          aria-invalid={isInvalid ? 'true' : 'false'}
                          aria-describedby={
                            isInvalid ? `${id}-weight-hint ${id}-weight-error` : `${id}-weight-hint`
                          }
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <InputGroupAddon align='inline-end'>
                          <InputGroupText>kg</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldDescription id={id + '-weight-hint'}>
                        0,001–100.000 kg (maks. 3 desimal).
                      </FieldDescription>
                      {isInvalid && <FieldError id={id + '-weight-error'} errors={errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field
                name='maxPriceText'
                validators={{
                  onChange: ({ value }) => {
                    if (value.trim() === '') return undefined
                    const parsedPrice = Number(value.replace(/\D/g, ''))
                    return !parsedPrice ||
                      !Number.isInteger(parsedPrice) ||
                      parsedPrice < 1 ||
                      parsedPrice > 1_000_000_000
                      ? 'Masukkan harga maksimum per kg yang valid (bilangan bulat positif).'
                      : undefined
                  },
                }}
              >
                {(field) => {
                  const errors = getFieldErrorMessages(field.state.meta.errors)
                  const isInvalid = field.state.meta.isTouched && errors.length > 0
                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor={id + '-price'}>Harga maks. per kg (opsional)</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align='inline-start'>
                          <InputGroupText>Rp</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          ref={priceRef}
                          id={id + '-price'}
                          name={field.name}
                          inputMode='numeric'
                          placeholder='Misal: 14000'
                          value={field.state.value}
                          aria-invalid={isInvalid ? 'true' : 'false'}
                          aria-describedby={isInvalid ? `${id}-price-error` : undefined}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value.replace(/\D/g, ''))
                          }
                        />
                      </InputGroup>
                      {isInvalid && <FieldError id={id + '-price-error'} errors={errors} />}
                    </Field>
                  )
                }}
              </form.Field>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <form.Field
                name='targetDate'
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'Pilih tanggal kebutuhan.'
                    if (value < today) return 'Tanggal kebutuhan tidak boleh di masa lalu.'
                    return undefined
                  },
                }}
              >
                {(field) => {
                  const errors = getFieldErrorMessages(field.state.meta.errors)
                  const isInvalid = field.state.meta.isTouched && errors.length > 0
                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor={id + '-date'}>Tanggal dibutuhkan</FieldLabel>
                      <Input
                        ref={dateRef}
                        id={id + '-date'}
                        name={field.name}
                        type='date'
                        min={today}
                        value={field.state.value}
                        aria-invalid={isInvalid ? 'true' : 'false'}
                        aria-describedby={isInvalid ? `${id}-date-error` : undefined}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                      />
                      {isInvalid && <FieldError id={id + '-date-error'} errors={errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field
                name='targetArea'
                validators={{
                  onChange: ({ value }) => {
                    const trimmed = value.trim()
                    if (trimmed.length < 3) return 'Wilayah pengambilan minimal 3 karakter.'
                    if (trimmed.length > 100) return 'Wilayah pengambilan maksimal 100 karakter.'
                    return undefined
                  },
                }}
              >
                {(field) => {
                  const errors = getFieldErrorMessages(field.state.meta.errors)
                  const isInvalid = field.state.meta.isTouched && errors.length > 0
                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor={id + '-area'}>Wilayah pengambilan</FieldLabel>
                      <Input
                        ref={areaRef}
                        id={id + '-area'}
                        name={field.name}
                        maxLength={100}
                        placeholder='Misal: Coblong, Bandung'
                        value={field.state.value}
                        aria-invalid={isInvalid ? 'true' : 'false'}
                        aria-describedby={isInvalid ? `${id}-area-error` : undefined}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                      />
                      {isInvalid && <FieldError id={id + '-area-error'} errors={errors} />}
                    </Field>
                  )
                }}
              </form.Field>
            </div>

            <form.Field name='notes'>
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={id + '-notes'}>Catatan (opsional)</FieldLabel>
                  <Textarea
                    id={id + '-notes'}
                    name={field.name}
                    rows={2}
                    maxLength={500}
                    placeholder='Misal: tingkat kematangan atau kemasan yang diinginkan'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          {create.isError && (
            <Alert variant='destructive'>
              <AlertDescription>{create.error.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={create.isPending}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type='submit' disabled={create.isPending}>
              {create.isPending && <Spinner data-icon='inline-start' />}
              <span>{create.isPending ? 'Menerbitkan…' : 'Terbitkan permintaan'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
