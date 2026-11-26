'use client'

import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import type { FarmerStep3Values } from '@/types/api/auth'

interface StepAccountInfoProps {
  values: FarmerStep3Values
  errors: Partial<Record<keyof FarmerStep3Values, string>>
  onChange: (next: Partial<FarmerStep3Values>) => void
  onBack: () => void
  onNext: () => void
}

export function StepAccountInfo({
  values,
  errors,
  onChange,
  onBack,
  onNext,
}: StepAccountInfoProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        onNext()
      }}
      className='flex flex-col gap-6'
    >
      <div className='flex flex-col gap-2 text-center'>
        <h1 className='text-[clamp(1.5rem,1.25rem+1vw,2rem)] leading-tight font-semibold text-foreground'>
          Buat akun dan kontak aktif Anda
        </h1>
        <p className='text-base leading-relaxed text-muted-foreground'>
          Gunakan nama asli serta email dan nomor WhatsApp yang aktif agar kami mudah memberi kabar
          saat ada pesanan masuk.
        </p>
      </div>

      <FieldGroup>
        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor='farmer-name'>Nama lengkap sesuai KTP</FieldLabel>
          <Input
            id='farmer-name'
            type='text'
            autoComplete='name'
            placeholder='Contoh: Budi Santoso'
            value={values.name}
            onChange={(event) => onChange({ name: event.target.value })}
            aria-invalid={Boolean(errors.name) || undefined}
          />
          {errors.name && <FieldError errors={[{ message: errors.name }]} />}
        </Field>

        <Field data-invalid={Boolean(errors.email) || undefined}>
          <FieldLabel htmlFor='farmer-email'>Alamat email aktif</FieldLabel>
          <Input
            id='farmer-email'
            type='email'
            autoComplete='email'
            placeholder='Contoh: pakbudi@email.com'
            value={values.email}
            onChange={(event) => onChange({ email: event.target.value })}
            aria-invalid={Boolean(errors.email) || undefined}
          />
          <FieldDescription>Dipakai saat Anda masuk ke akun petani nanti.</FieldDescription>
          {errors.email && <FieldError errors={[{ message: errors.email }]} />}
        </Field>

        <Field data-invalid={Boolean(errors.phone) || undefined}>
          <FieldLabel htmlFor='farmer-phone'>Nomor WhatsApp / HP aktif</FieldLabel>
          <Input
            id='farmer-phone'
            type='tel'
            inputMode='tel'
            autoComplete='tel'
            placeholder='Contoh: 081234567890'
            className='tabular-nums'
            value={values.phone}
            onChange={(event) => onChange({ phone: event.target.value.replace(/[^\d+]/g, '') })}
            aria-invalid={Boolean(errors.phone) || undefined}
          />
          <FieldDescription>
            Dipakai untuk koordinasi pengambilan barang dengan pembeli yang sudah memesan.
          </FieldDescription>
          {errors.phone && <FieldError errors={[{ message: errors.phone }]} />}
        </Field>

        <Field data-invalid={Boolean(errors.password) || undefined}>
          <FieldLabel htmlFor='farmer-password'>Buat kata sandi</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='farmer-password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='new-password'
              placeholder='Minimal 8 karakter (huruf dan angka)'
              value={values.password}
              onChange={(event) => onChange({ password: event.target.value })}
              aria-invalid={Boolean(errors.password) || undefined}
            />
            <InputGroupAddon align='inline-end'>
              <InputGroupButton
                size='icon-sm'
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>
            Contoh yang mudah diingat namun aman: Panen2026 atau KebunBudi1.
          </FieldDescription>
          {errors.password && <FieldError errors={[{ message: errors.password }]} />}
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword) || undefined}>
          <FieldLabel htmlFor='farmer-confirm-password'>Ulangi kata sandi</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='farmer-confirm-password'
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete='new-password'
              placeholder='Ketik ulang kata sandi di atas'
              value={values.confirmPassword}
              onChange={(event) => onChange({ confirmPassword: event.target.value })}
              aria-invalid={Boolean(errors.confirmPassword) || undefined}
            />
            <InputGroupAddon align='inline-end'>
              <InputGroupButton
                size='icon-sm'
                aria-pressed={showConfirmPassword}
                aria-label={
                  showConfirmPassword ? 'Sembunyikan ulangi kata sandi' : 'Lihat ulangi kata sandi'
                }
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {errors.confirmPassword && <FieldError errors={[{ message: errors.confirmPassword }]} />}
        </Field>
      </FieldGroup>

      <div className='flex flex-col gap-2.5'>
        <Button type='submit' size='lg' className='w-full rounded-full'>
          Lanjut ke Langkah 4: Lokasi Lahan
        </Button>
        <Button type='button' variant='ghost' className='w-full rounded-full' onClick={onBack}>
          <ArrowLeft data-icon='inline-start' />
          <span>Kembali ke Langkah 2</span>
        </Button>
      </div>
    </form>
  )
}
