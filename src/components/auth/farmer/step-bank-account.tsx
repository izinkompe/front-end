'use client'

import { ArrowLeft, Landmark } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
import { bankOptions } from '@/components/auth/farmer/farmer-form-helpers'
import type { FarmerStep5Values } from '@/types/api/auth'

interface StepBankAccountProps {
  values: FarmerStep5Values
  errors: Partial<Record<keyof FarmerStep5Values, string>>
  onChange: (next: Partial<FarmerStep5Values>) => void
  onBack: () => void
  onNext: () => void
}

export function StepBankAccount({
  values,
  errors,
  onChange,
  onBack,
  onNext,
}: StepBankAccountProps) {
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
          Rekening penerima uang hasil penjualan
        </h1>
        <p className='text-base leading-relaxed text-muted-foreground'>
          Masukkan nomor rekening bank tempat Anda menerima transfer pembayaran dari pembeli.
        </p>
      </div>

      <Alert>
        <Landmark />
        <AlertTitle>Pembayaran dicek langsung oleh Admin</AlertTitle>
        <AlertDescription>
          Pembeli akan mengirim bukti transfer ke rekening ini, lalu Admin PanganTani memeriksa
          kecocokannya sebelum pesanan Anda dinyatakan siap diambil.
        </AlertDescription>
      </Alert>

      <FieldGroup>
        <Field data-invalid={Boolean(errors.bankName) || undefined}>
          <FieldLabel htmlFor='farmer-bank-name'>Nama bank</FieldLabel>
          <Select
            value={values.bankName}
            onValueChange={(nextBank) => nextBank && onChange({ bankName: nextBank })}
          >
            <SelectTrigger
              id='farmer-bank-name'
              className='w-full'
              aria-invalid={Boolean(errors.bankName) || undefined}
            >
              <SelectValue placeholder='Pilih nama bank Anda' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {bankOptions.map((bank) => (
                  <SelectItem key={bank.value} value={bank.value}>
                    {bank.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.bankName && <FieldError errors={[{ message: errors.bankName }]} />}
        </Field>

        <Field data-invalid={Boolean(errors.accountNumber) || undefined}>
          <FieldLabel htmlFor='farmer-account-number'>Nomor rekening</FieldLabel>
          <Input
            id='farmer-account-number'
            type='text'
            inputMode='numeric'
            placeholder='Contoh: 123401002345501'
            className='tabular-nums'
            value={values.accountNumber}
            onChange={(event) => onChange({ accountNumber: event.target.value.replace(/\D/g, '') })}
            aria-invalid={Boolean(errors.accountNumber) || undefined}
          />
          <FieldDescription>
            Tulis angka saja tanpa tanda strip atau spasi sesuai buku tabungan Anda.
          </FieldDescription>
          {errors.accountNumber && <FieldError errors={[{ message: errors.accountNumber }]} />}
        </Field>

        <Field data-invalid={Boolean(errors.accountHolderName) || undefined}>
          <FieldLabel htmlFor='farmer-account-holder'>Nama pemilik rekening</FieldLabel>
          <Input
            id='farmer-account-holder'
            type='text'
            placeholder='Contoh: Budi Santoso'
            value={values.accountHolderName}
            onChange={(event) => onChange({ accountHolderName: event.target.value })}
            aria-invalid={Boolean(errors.accountHolderName) || undefined}
          />
          <FieldDescription>
            Pastikan nama sama persis dengan yang tertulis di buku tabungan atau rekening kelompok
            tani.
          </FieldDescription>
          {errors.accountHolderName && (
            <FieldError errors={[{ message: errors.accountHolderName }]} />
          )}
        </Field>
      </FieldGroup>

      <div className='flex flex-col gap-2.5'>
        <Button type='submit' size='lg' className='w-full rounded-full'>
          Lanjut ke Langkah 6: Verifikasi Identitas
        </Button>
        <Button type='button' variant='ghost' className='w-full rounded-full' onClick={onBack}>
          <ArrowLeft data-icon='inline-start' />
          <span>Kembali ke Langkah 4</span>
        </Button>
      </div>
    </form>
  )
}
