'use client'

import { useId, useState } from 'react'
import { Calculator } from 'lucide-react'
import { formatPlainRupiah } from '@/components/home/offer-card-helpers'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'

const formatPortions = new Intl.NumberFormat('id-ID')

export function OfferPortionHelper({
  quantityKg,
  pricePerKg,
}: {
  quantityKg: number | null
  pricePerKg: number
}) {
  const id = useId()
  const [grams, setGrams] = useState('150')
  const unitWeight = Number(grams)
  const isValid = Number.isInteger(unitWeight) && unitWeight > 0 && unitWeight <= 100_000
  const portions =
    isValid && quantityKg ? Math.floor(Math.round(quantityKg * 1000) / unitWeight) : 0

  return (
    <details className='rounded-lg border border-border bg-muted/20 p-3'>
      <summary className='flex items-center gap-2 text-sm font-semibold text-foreground'>
        <Calculator className='size-4 text-primary' aria-hidden='true' />
        <span>Kalkulator porsi</span>
      </summary>
      <div className='mt-3 flex flex-col gap-2.5 text-sm'>
        <Field data-invalid={!isValid || undefined}>
          <FieldLabel htmlFor={id}>Gram per porsi</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id={id}
              type='text'
              inputMode='numeric'
              maxLength={6}
              value={grams}
              aria-invalid={!isValid ? 'true' : 'false'}
              aria-describedby={!isValid ? `${id}-error` : undefined}
              onChange={(event) => setGrams(event.target.value.replace(/\D/g, ''))}
            />
            <InputGroupAddon align='inline-end'>
              <InputGroupText>gram</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          {!isValid && (
            <FieldError
              id={id + '-error'}
              errors={[{ message: 'Masukkan bilangan bulat antara 1 dan 100.000 gram.' }]}
            />
          )}
        </Field>

        {isValid && (
          <p className='text-muted-foreground tabular-nums'>
            {quantityKg
              ? portions
                ? `${formatPortions.format(portions)} porsi, sekitar ${formatPlainRupiah(Math.round((pricePerKg * unitWeight) / 1000))} per porsi.`
                : 'Berat pesanan kurang dari satu porsi.'
              : 'Masukkan berat pesanan untuk menghitung perkiraan porsi.'}
          </p>
        )}
      </div>
    </details>
  )
}
