'use client'

import { Check, Plus } from 'lucide-react'
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
import { farmerTypeOptions } from '@/components/auth/farmer/farmer-form-helpers'
import { cn } from '@/lib/utils'
import type { FarmerStep1Values, FarmerType } from '@/types/api/auth'

interface StepFarmProfileProps {
  values: FarmerStep1Values
  errors: Partial<Record<keyof FarmerStep1Values, string>>
  onChange: (next: Partial<FarmerStep1Values>) => void
  onNext: () => void
}

function FarmerTypeIllustration({ type }: { type: FarmerType }) {
  if (type === 'individual') {
    return (
      <svg
        viewBox='0 0 240 128'
        fill='none'
        className='h-32 w-full bg-muted/60 text-primary'
        aria-hidden='true'
      >
        <circle cx='188' cy='34' r='16' className='fill-primary/20' />
        <path
          d='M0 104C42 86 96 86 146 98C184 107 214 105 240 94V128H0V104Z'
          className='fill-primary/15'
        />
        <path
          d='M120 98V52M120 72C102 72 90 60 90 46C106 46 118 56 120 72ZM120 62C136 62 148 50 148 36C132 36 122 46 120 62Z'
          stroke='currentColor'
          strokeWidth='4'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    )
  }

  if (type === 'poktan') {
    return (
      <svg
        viewBox='0 0 240 128'
        fill='none'
        className='h-32 w-full bg-muted/60 text-primary'
        aria-hidden='true'
      >
        <path
          d='M0 100C58 84 118 84 176 96C204 102 224 101 240 94V128H0V100Z'
          className='fill-primary/15'
        />
        <circle cx='86' cy='50' r='11' stroke='currentColor' strokeWidth='3.5' />
        <path
          d='M66 86C66 74 75 66 86 66C97 66 106 74 106 86'
          stroke='currentColor'
          strokeWidth='3.5'
          strokeLinecap='round'
        />
        <circle
          cx='120'
          cy='42'
          r='13'
          className='fill-primary/20'
          stroke='currentColor'
          strokeWidth='3.5'
        />
        <path
          d='M96 90C96 74 106 64 120 64C134 64 144 74 144 90'
          stroke='currentColor'
          strokeWidth='3.5'
          strokeLinecap='round'
        />
        <circle cx='154' cy='50' r='11' stroke='currentColor' strokeWidth='3.5' />
        <path
          d='M134 86C134 74 143 66 154 66C165 66 174 74 174 86'
          stroke='currentColor'
          strokeWidth='3.5'
          strokeLinecap='round'
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox='0 0 240 128'
      fill='none'
      className='h-32 w-full bg-muted/60 text-primary'
      aria-hidden='true'
    >
      <path
        d='M0 102C60 90 120 92 180 100C206 103 224 102 240 96V128H0V102Z'
        className='fill-primary/15'
      />
      <path
        d='M72 56L120 26L168 56V96H72V56Z'
        className='fill-primary/10'
        stroke='currentColor'
        strokeWidth='3.5'
        strokeLinejoin='round'
      />
      <rect x='104' y='66' width='32' height='30' rx='4' stroke='currentColor' strokeWidth='3.5' />
      <path d='M92 54H148' stroke='currentColor' strokeWidth='3.5' strokeLinecap='round' />
    </svg>
  )
}

export function StepFarmProfile({ values, errors, onChange, onNext }: StepFarmProfileProps) {
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
        <h1 className='text-[clamp(1.5rem,1.25rem+1vw,2rem)] leading-tight font-semibold text-foreground'>
          Mari mulai: Bagaimana bentuk usaha tani Anda?
        </h1>
        <p className='text-base leading-relaxed text-muted-foreground'>
          Pilih jenis usaha tani dan tuliskan nama kebun atau kelompok tani Anda. Semua langkah
          pendaftaran wajib diisi agar akun siap diverifikasi.
        </p>
      </div>

      <FieldSet className='gap-4'>
        <FieldLegend variant='label' className='text-center text-foreground'>
          Pilih jenis usaha tani Anda
        </FieldLegend>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {farmerTypeOptions.map((option) => {
            const isSelected = values.farmerType === option.value
            return (
              <Card
                key={option.value}
                className={cn(
                  'gap-0 pt-0 transition-shadow',
                  isSelected ? 'bg-primary/5 ring-2 ring-primary' : 'hover:ring-foreground/25'
                )}
              >
                <FarmerTypeIllustration type={option.value} />
                <CardHeader className='pt-4 text-center'>
                  <CardTitle>{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardFooter className='mt-auto justify-center border-t-0 bg-transparent pt-2 pb-4'>
                  <Button
                    type='button'
                    variant={isSelected ? 'default' : 'outline'}
                    className='rounded-full'
                    aria-pressed={isSelected}
                    onClick={() => onChange({ farmerType: option.value })}
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
        {errors.farmerType && (
          <FieldError className='text-center' errors={[{ message: errors.farmerType }]} />
        )}
      </FieldSet>

      <div className='mx-auto flex w-full max-w-md flex-col gap-6'>
        <FieldGroup>
          <Field data-invalid={Boolean(errors.farmName) || undefined}>
            <FieldLabel htmlFor='farmer-farm-name'>
              Nama kebun, sawah, atau kelompok tani
            </FieldLabel>
            <Input
              id='farmer-farm-name'
              type='text'
              placeholder='Contoh: Kebun Sayur Pak Budi atau Kelompok Tani Subur Makmur'
              value={values.farmName}
              onChange={(event) => onChange({ farmName: event.target.value })}
              aria-invalid={Boolean(errors.farmName) || undefined}
            />
            <FieldDescription>
              Nama ini akan tampil di halaman penawaran hasil panen Anda.
            </FieldDescription>
            {errors.farmName && <FieldError errors={[{ message: errors.farmName }]} />}
          </Field>
        </FieldGroup>

        <Button type='submit' size='lg' className='w-full rounded-full'>
          Lanjut ke Langkah 2: Kategori Hasil Panen
        </Button>
      </div>
    </form>
  )
}
