'use client'

import Image from 'next/image'
import { ArrowLeft, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { commodityOptions } from '@/components/auth/farmer/farmer-form-helpers'
import { cn } from '@/lib/utils'
import type { CommodityCategory, FarmerStep2Values } from '@/types/api/auth'

interface StepCommoditiesProps {
  values: FarmerStep2Values
  errors: Partial<Record<keyof FarmerStep2Values, string>>
  onChange: (next: Partial<FarmerStep2Values>) => void
  onBack: () => void
  onNext: () => void
}

export function StepCommodities({
  values,
  errors,
  onChange,
  onBack,
  onNext,
}: StepCommoditiesProps) {
  const isOtherSelected = values.primaryCommodities.includes('lainnya')

  function toggleCommodity(category: CommodityCategory) {
    const exists = values.primaryCommodities.includes(category)
    const nextCommodities = exists
      ? values.primaryCommodities.filter((item) => item !== category)
      : [...values.primaryCommodities, category]

    onChange({
      primaryCommodities: nextCommodities,
      customCommodity: nextCommodities.includes('lainnya') ? values.customCommodity : '',
    })
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        onNext()
      }}
      className='flex flex-col gap-8'
    >
      <div className='mx-auto flex max-w-2xl flex-col gap-2 text-center'>
        <h1 className='type-h1 font-semibold text-foreground'>
          Hasil panen apa saja yang Anda tanam?
        </h1>
        <p className='text-base leading-relaxed text-muted-foreground'>
          Pilih satu atau beberapa kategori hasil panen utama Anda. Jika belum ada dalam daftar,
          pilih kartu Lainnya untuk menuliskan kategori baru.
        </p>
      </div>

      <FieldSet className='gap-4'>
        <FieldLegend variant='label' className='text-center text-foreground'>
          Pilih kategori hasil panen (boleh lebih dari satu)
        </FieldLegend>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {commodityOptions.map((item) => {
            const isSelected = values.primaryCommodities.includes(item.value)
            return (
              <Card
                key={item.value}
                className={cn(
                  'gap-0 pt-0 transition-shadow',
                  isSelected ? 'bg-primary/5 ring-2 ring-primary' : 'hover:ring-foreground/25'
                )}
              >
                <div className='relative aspect-16/10 w-full overflow-hidden bg-muted'>
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    className='object-cover'
                  />
                </div>
                <CardHeader className='pt-4 text-center'>
                  <CardTitle>{item.label}</CardTitle>
                  <CardDescription>{item.examples}</CardDescription>
                </CardHeader>
                <CardFooter className='mt-auto justify-center border-t-0 bg-transparent pt-2 pb-4'>
                  <Button
                    type='button'
                    variant={isSelected ? 'default' : 'outline'}
                    className='rounded-full'
                    aria-pressed={isSelected}
                    onClick={() => toggleCommodity(item.value)}
                  >
                    {isSelected ? (
                      <Check data-icon='inline-start' />
                    ) : (
                      <Plus data-icon='inline-start' />
                    )}
                    <span>{isSelected ? 'Dipilih' : 'Pilih'}</span>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {errors.primaryCommodities && (
          <FieldError className='text-center' errors={[{ message: errors.primaryCommodities }]} />
        )}
      </FieldSet>

      <div className='mx-auto flex w-full max-w-md flex-col gap-6'>
        {isOtherSelected && (
          <FieldGroup>
            <Field data-invalid={Boolean(errors.customCommodity) || undefined}>
              <FieldLabel htmlFor='farmer-custom-commodity'>
                Tuliskan kategori hasil panen lainnya
              </FieldLabel>
              <Input
                id='farmer-custom-commodity'
                type='text'
                placeholder='Contoh: Jamur tiram, madu hutan, atau telur bebek'
                value={values.customCommodity ?? ''}
                onChange={(event) => onChange({ customCommodity: event.target.value })}
                aria-invalid={Boolean(errors.customCommodity) || undefined}
              />
              <FieldDescription>
                Kategori baru ini akan disimpan pada profil kebun Anda.
              </FieldDescription>
              {errors.customCommodity && (
                <FieldError errors={[{ message: errors.customCommodity }]} />
              )}
            </Field>
          </FieldGroup>
        )}

        <div className='flex flex-col gap-2.5'>
          <Button type='submit' size='lg' className='w-full rounded-full'>
            Lanjut ke Langkah 3: Data Akun
          </Button>
          <Button type='button' variant='ghost' className='w-full rounded-full' onClick={onBack}>
            <ArrowLeft data-icon='inline-start' />
            <span>Kembali ke Langkah 1</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
