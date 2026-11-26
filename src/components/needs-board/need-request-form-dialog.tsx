'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
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

  const [commodityName, setCommodityName] = useState('')
  const [category, setCategory] = useState('')
  const [weightText, setWeightText] = useState('')
  const [maxPriceText, setMaxPriceText] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [targetArea, setTargetArea] = useState('')
  const [notes, setNotes] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)

  const commodityRef = useRef<HTMLInputElement | null>(null)
  const weightRef = useRef<HTMLInputElement | null>(null)
  const priceRef = useRef<HTMLInputElement | null>(null)
  const dateRef = useRef<HTMLInputElement | null>(null)
  const areaRef = useRef<HTMLInputElement | null>(null)

  const parsedWeight = parseWeightInputKg(weightText)
  const parsedPrice = maxPriceText.trim() ? Number(maxPriceText.replace(/\D/g, '')) : undefined

  const errors = {
    commodityName:
      commodityName.trim().length < 2
        ? 'Nama komoditas minimal 2 karakter.'
        : commodityName.trim().length > 100
          ? 'Nama komoditas maksimal 100 karakter.'
          : null,
    category: !category ? 'Pilih kategori komoditas.' : null,
    weight:
      parsedWeight === null || parsedWeight < 0.001 || parsedWeight > 100_000
        ? 'Masukkan berat antara 0,001 hingga 100.000 kg (maks. 3 angka desimal).'
        : null,
    maxPrice:
      maxPriceText.trim() !== '' &&
      (!parsedPrice ||
        !Number.isInteger(parsedPrice) ||
        parsedPrice < 1 ||
        parsedPrice > 1_000_000_000)
        ? 'Masukkan harga maksimum per kg yang valid (bilangan bulat positif).'
        : null,
    targetDate: !targetDate
      ? 'Pilih tanggal kebutuhan.'
      : targetDate < today
        ? 'Tanggal kebutuhan tidak boleh di masa lalu.'
        : null,
    targetArea:
      targetArea.trim().length < 3
        ? 'Wilayah pengambilan minimal 3 karakter.'
        : targetArea.trim().length > 100
          ? 'Wilayah pengambilan maksimal 100 karakter.'
          : null,
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (create.isPending) return
    setSubmitted(true)

    if (errors.commodityName) {
      commodityRef.current?.focus()
      return
    }
    if (errors.category) {
      return
    }
    if (errors.weight || parsedWeight === null) {
      weightRef.current?.focus()
      return
    }
    if (errors.maxPrice) {
      priceRef.current?.focus()
      return
    }
    if (errors.targetDate) {
      dateRef.current?.focus()
      return
    }
    if (errors.targetArea) {
      areaRef.current?.focus()
      return
    }

    const parsed = CreateNeedRequestSchema.safeParse({
      commodityName: commodityName.trim(),
      category,
      neededQuantityKg: parsedWeight,
      maxPricePerKg: parsedPrice,
      targetDate,
      targetArea: targetArea.trim(),
      notes: notes.trim() || undefined,
    })

    if (!parsed.success) {
      return
    }

    create.mutate(parsed.data, {
      onSuccess: (need) => {
        onOpenChange(false)
        onCreated(need.id)
      },
    })
  }

  const showCommodityError = Boolean((submitted || touched.commodityName) && errors.commodityName)
  const showCategoryError = Boolean((submitted || touched.category) && errors.category)
  const showWeightError = Boolean((submitted || touched.weight) && errors.weight)
  const showPriceError = Boolean((submitted || touched.maxPrice) && errors.maxPrice)
  const showDateError = Boolean((submitted || touched.targetDate) && errors.targetDate)
  const showAreaError = Boolean((submitted || touched.targetArea) && errors.targetArea)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg'>
        <DialogHeader className='pr-8'>
          <DialogTitle>Pasang kebutuhan pangan</DialogTitle>
          <DialogDescription>
            Publikasikan kebutuhan komoditas Anda agar petani sekitar dapat mengajukan penawaran.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <FieldGroup>
            <Field data-invalid={showCommodityError || undefined}>
              <FieldLabel htmlFor={id + '-commodity'}>Komoditas</FieldLabel>
              <Input
                ref={commodityRef}
                id={id + '-commodity'}
                name='commodityName'
                maxLength={100}
                placeholder='Misal: Tomat Merah, Beras IR64'
                value={commodityName}
                aria-invalid={showCommodityError ? 'true' : 'false'}
                aria-describedby={showCommodityError ? `${id}-commodity-error` : undefined}
                onBlur={() => setTouched((prev) => ({ ...prev, commodityName: true }))}
                onChange={(event) => setCommodityName(event.target.value)}
              />
              {showCommodityError && (
                <FieldError
                  id={id + '-commodity-error'}
                  errors={[{ message: errors.commodityName as string }]}
                />
              )}
            </Field>

            <Field data-invalid={showCategoryError || undefined}>
              <FieldLabel htmlFor={id + '-category'}>Kategori</FieldLabel>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value ?? '')
                  setTouched((prev) => ({ ...prev, category: true }))
                }}
                name='category'
              >
                <SelectTrigger
                  id={id + '-category'}
                  className='w-full'
                  aria-invalid={showCategoryError ? 'true' : 'false'}
                  aria-describedby={showCategoryError ? `${id}-category-error` : undefined}
                >
                  <SelectValue placeholder='Pilih kategori'>
                    {mainCategories.find((item) => item.slug === category)?.label}
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
              {showCategoryError && (
                <FieldError
                  id={id + '-category-error'}
                  errors={[{ message: errors.category as string }]}
                />
              )}
            </Field>

            <div className='grid gap-4 sm:grid-cols-2'>
              <Field data-invalid={showWeightError || undefined}>
                <FieldLabel htmlFor={id + '-weight'}>Berat dibutuhkan</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    ref={weightRef}
                    id={id + '-weight'}
                    name='neededQuantityKg'
                    inputMode='decimal'
                    maxLength={10}
                    placeholder='Misal: 25'
                    value={weightText}
                    aria-invalid={showWeightError ? 'true' : 'false'}
                    aria-describedby={
                      showWeightError ? `${id}-weight-hint ${id}-weight-error` : `${id}-weight-hint`
                    }
                    onBlur={() => setTouched((prev) => ({ ...prev, weight: true }))}
                    onChange={(event) => setWeightText(event.target.value)}
                  />
                  <InputGroupAddon align='inline-end'>
                    <InputGroupText>kg</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription id={id + '-weight-hint'}>
                  0,001–100.000 kg (maks. 3 desimal).
                </FieldDescription>
                {showWeightError && (
                  <FieldError
                    id={id + '-weight-error'}
                    errors={[{ message: errors.weight as string }]}
                  />
                )}
              </Field>

              <Field data-invalid={showPriceError || undefined}>
                <FieldLabel htmlFor={id + '-price'}>Harga maks. per kg (opsional)</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align='inline-start'>
                    <InputGroupText>Rp</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    ref={priceRef}
                    id={id + '-price'}
                    name='maxPricePerKg'
                    inputMode='numeric'
                    placeholder='Misal: 14000'
                    value={maxPriceText}
                    aria-invalid={showPriceError ? 'true' : 'false'}
                    aria-describedby={showPriceError ? `${id}-price-error` : undefined}
                    onBlur={() => setTouched((prev) => ({ ...prev, maxPrice: true }))}
                    onChange={(event) => setMaxPriceText(event.target.value.replace(/\D/g, ''))}
                  />
                </InputGroup>
                {showPriceError && (
                  <FieldError
                    id={id + '-price-error'}
                    errors={[{ message: errors.maxPrice as string }]}
                  />
                )}
              </Field>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <Field data-invalid={showDateError || undefined}>
                <FieldLabel htmlFor={id + '-date'}>Tanggal dibutuhkan</FieldLabel>
                <Input
                  ref={dateRef}
                  id={id + '-date'}
                  name='targetDate'
                  type='date'
                  min={today}
                  value={targetDate}
                  aria-invalid={showDateError ? 'true' : 'false'}
                  aria-describedby={showDateError ? `${id}-date-error` : undefined}
                  onBlur={() => setTouched((prev) => ({ ...prev, targetDate: true }))}
                  onChange={(event) => setTargetDate(event.target.value)}
                />
                {showDateError && (
                  <FieldError
                    id={id + '-date-error'}
                    errors={[{ message: errors.targetDate as string }]}
                  />
                )}
              </Field>

              <Field data-invalid={showAreaError || undefined}>
                <FieldLabel htmlFor={id + '-area'}>Wilayah pengambilan</FieldLabel>
                <Input
                  ref={areaRef}
                  id={id + '-area'}
                  name='targetArea'
                  maxLength={100}
                  placeholder='Misal: Coblong, Bandung'
                  value={targetArea}
                  aria-invalid={showAreaError ? 'true' : 'false'}
                  aria-describedby={showAreaError ? `${id}-area-error` : undefined}
                  onBlur={() => setTouched((prev) => ({ ...prev, targetArea: true }))}
                  onChange={(event) => setTargetArea(event.target.value)}
                />
                {showAreaError && (
                  <FieldError
                    id={id + '-area-error'}
                    errors={[{ message: errors.targetArea as string }]}
                  />
                )}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor={id + '-notes'}>Catatan (opsional)</FieldLabel>
              <Textarea
                id={id + '-notes'}
                name='notes'
                rows={2}
                maxLength={500}
                placeholder='Misal: tingkat kematangan atau kemasan yang diinginkan'
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Field>
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
