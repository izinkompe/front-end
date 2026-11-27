'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, CheckCircle2, Upload } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import type { FarmerDocumentMeta } from '@/types/api/auth'

export interface StepVerificationState {
  idCardNumber: string
  identityDocument: FarmerDocumentMeta | null
  farmDocument: FarmerDocumentMeta | null
  agreedToTerms: boolean
}

interface StepVerificationProps {
  values: StepVerificationState
  errors: Partial<Record<keyof StepVerificationState, string>>
  submitError?: string
  isSubmitting: boolean
  summary: {
    farmName: string
    name: string
    areaName: string
    bankName: string
    accountNumber: string
  }
  onChange: (next: Partial<StepVerificationState>) => void
  onBack: () => void
  onSubmit: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DocumentUploadBox({
  id,
  label,
  helperText,
  file,
  error,
  onFileSelect,
}: {
  id: string
  label: string
  helperText: string
  file: FarmerDocumentMeta | null
  error?: string
  onFileSelect: (meta: FarmerDocumentMeta | null, fileError?: string) => void
}) {
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0]
    if (!picked) {
      onFileSelect(null)
      return
    }
    if (picked.type !== 'image/jpeg' && picked.type !== 'image/png') {
      onFileSelect(null, 'Format foto harus JPG atau PNG')
      return
    }
    if (picked.size > 5 * 1024 * 1024) {
      onFileSelect(null, 'Ukuran foto terlalu besar. Maksimal 5 MB.')
      return
    }
    onFileSelect({
      name: picked.name,
      type: picked.type,
      size: picked.size,
    })
  }

  return (
    <Field data-invalid={Boolean(error) || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <label
        htmlFor={id}
        className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/40 px-4 py-5 text-center transition-colors hover:bg-muted/70 focus-within:ring-2 focus-within:ring-ring'
      >
        <input
          id={id}
          type='file'
          accept='image/jpeg,image/png'
          onChange={handleFileChange}
          className='sr-only'
          aria-invalid={Boolean(error) || undefined}
        />
        {file ? (
          <div className='flex flex-col items-center gap-1.5'>
            <CheckCircle2 className='size-6 text-primary' aria-hidden='true' />
            <p className='max-w-full truncate text-base font-medium text-foreground'>{file.name}</p>
            <Badge variant='secondary'>{formatFileSize(file.size)} • Siap dikirim</Badge>
            <span className='text-sm font-medium text-primary underline underline-offset-4'>
              Ganti foto
            </span>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-1.5'>
            <Upload className='size-6 text-muted-foreground' aria-hidden='true' />
            <span className='text-base font-medium text-foreground'>
              Ketuk di sini untuk pilih foto dari HP atau komputer
            </span>
            <span className='text-sm text-muted-foreground'>
              Format JPG atau PNG, maksimal 5 MB
            </span>
          </div>
        )}
      </label>
      <FieldDescription>{helperText}</FieldDescription>
      {error && <FieldError errors={[{ message: error }]} />}
    </Field>
  )
}

export function StepVerification({
  values,
  errors,
  submitError,
  isSubmitting,
  summary,
  onChange,
  onBack,
  onSubmit,
}: StepVerificationProps) {
  const [identityFileError, setIdentityFileError] = useState<string | undefined>()
  const [farmFileError, setFarmFileError] = useState<string | undefined>()

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className='flex flex-col gap-6'
    >
      <div className='flex flex-col gap-2 text-center'>
        <h1 className='type-h1 font-semibold text-foreground'>
          Selesaikan pendaftaran akun petani Anda
        </h1>
        <p className='text-base leading-relaxed text-muted-foreground'>
          Lengkapi bukti identitas agar Admin PanganTani dapat menyetujui akun Anda untuk mulai
          menerbitkan penawaran panen.
        </p>
      </div>

      {submitError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Card size='sm'>
        <CardHeader>
          <CardTitle>Ringkasan data Anda</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 gap-3 text-base sm:grid-cols-2'>
          <div>
            <p className='text-sm text-muted-foreground'>Nama &amp; Kebun</p>
            <p className='font-medium text-foreground'>
              {summary.name} — {summary.farmName}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Wilayah &amp; Rekening</p>
            <p className='font-medium text-foreground tabular-nums'>
              {summary.areaName} • {summary.bankName} {summary.accountNumber}
            </p>
          </div>
        </CardContent>
      </Card>

      <FieldGroup>
        <Field data-invalid={Boolean(errors.idCardNumber) || undefined}>
          <FieldLabel htmlFor='farmer-nik'>Nomor KTP (NIK — 16 angka)</FieldLabel>
          <Input
            id='farmer-nik'
            type='text'
            inputMode='numeric'
            maxLength={16}
            placeholder='Contoh: 3217012345678901'
            className='tabular-nums'
            value={values.idCardNumber}
            onChange={(event) =>
              onChange({ idCardNumber: event.target.value.replace(/\D/g, '').slice(0, 16) })
            }
            aria-invalid={Boolean(errors.idCardNumber) || undefined}
          />
          <FieldDescription>
            Masukkan 16 angka NIK yang tertera di bagian atas KTP Anda ({values.idCardNumber.length}
            /16 angka).
          </FieldDescription>
          {errors.idCardNumber && <FieldError errors={[{ message: errors.idCardNumber }]} />}
        </Field>

        <DocumentUploadBox
          id='farmer-ktp-upload'
          label='Foto KTP yang jelas'
          helperText='Pastikan tulisan nama dan NIK di foto KTP terbaca jelas dan tidak buram.'
          file={values.identityDocument}
          error={identityFileError ?? errors.identityDocument}
          onFileSelect={(meta, fileError) => {
            setIdentityFileError(fileError)
            onChange({ identityDocument: meta })
          }}
        />

        <DocumentUploadBox
          id='farmer-farm-upload'
          label='Foto lahan / kebun atau surat kelompok tani'
          helperText='Bisa berupa foto kebun Anda saat ini atau surat keterangan kelompok tani.'
          file={values.farmDocument}
          error={farmFileError ?? errors.farmDocument}
          onFileSelect={(meta, fileError) => {
            setFarmFileError(fileError)
            onChange({ farmDocument: meta })
          }}
        />

        <Field
          orientation='horizontal'
          data-invalid={Boolean(errors.agreedToTerms) || undefined}
          className='items-start gap-3 rounded-xl border border-border bg-muted/30 p-4'
        >
          <Checkbox
            id='farmer-agree-terms'
            checked={values.agreedToTerms}
            onCheckedChange={(checked) => onChange({ agreedToTerms: Boolean(checked) })}
            aria-invalid={Boolean(errors.agreedToTerms) || undefined}
          />
          <FieldContent>
            <FieldLabel
              htmlFor='farmer-agree-terms'
              className='text-sm leading-relaxed font-normal sm:text-base'
            >
              <span>
                Saya menyatakan data yang diisi benar serta menyetujui{' '}
                <Link
                  href='/syarat'
                  className='font-medium text-foreground underline underline-offset-4 hover:text-primary'
                >
                  Syarat &amp; Ketentuan
                </Link>{' '}
                dan{' '}
                <Link
                  href='/privasi'
                  className='font-medium text-foreground underline underline-offset-4 hover:text-primary'
                >
                  Kebijakan Privasi
                </Link>{' '}
                PanganTani.
              </span>
            </FieldLabel>
            {errors.agreedToTerms && <FieldError errors={[{ message: errors.agreedToTerms }]} />}
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className='flex flex-col gap-2.5'>
        <Button type='submit' size='lg' className='w-full rounded-full' disabled={isSubmitting}>
          {isSubmitting && <Spinner data-icon='inline-start' />}
          <span>{isSubmitting ? 'Mengirim pendaftaran...' : 'Selesaikan Pendaftaran'}</span>
        </Button>
        <Button
          type='button'
          variant='ghost'
          className='w-full rounded-full'
          disabled={isSubmitting}
          onClick={onBack}
        >
          <ArrowLeft data-icon='inline-start' />
          <span>Kembali ke Langkah 5</span>
        </Button>
      </div>
    </form>
  )
}
