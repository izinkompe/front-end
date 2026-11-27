'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle } from 'lucide-react'
import {
  OTHER_BANK_VALUE,
  bankOptions,
  formatBankNameInput,
  getBankOptionLabel,
  getFieldErrorMessages,
  isCustomBankName,
  normalizeBankName,
} from '@/components/auth/farmer/farmer-form-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { useUpdateFarmerBankAccount } from '@/hooks/api/use-farmer-management'
import type { FarmerBankAccount } from '@/types/api/auth'
import { UpdateFarmerBankAccountRequestSchema } from '@/types/api/farmer-management'

interface BankAccountSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialAccount: FarmerBankAccount
  onSaved: () => void
}

function BankAccountForm({
  initialAccount,
  onSaved,
  onCancel,
}: {
  initialAccount: FarmerBankAccount
  onSaved: () => void
  onCancel: () => void
}) {
  const updateBank = useUpdateFarmerBankAccount()
  const [isOtherBankSelected, setIsOtherBankSelected] = useState(() =>
    isCustomBankName(initialAccount.bankName)
  )

  const form = useForm({
    defaultValues: {
      bankName: initialAccount.bankName || 'BRI',
      accountNumber: initialAccount.accountNumber || '',
      accountHolderName: initialAccount.accountHolderName || '',
    },
    validators: {
      onSubmit: UpdateFarmerBankAccountRequestSchema,
    },
    onSubmit: async ({ value }) => {
      await updateBank.mutateAsync({
        bankName: normalizeBankName(value.bankName),
        accountNumber: value.accountNumber.trim(),
        accountHolderName: value.accountHolderName.trim(),
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
        {updateBank.isError && (
          <Alert variant='destructive'>
            <AlertCircle />
            <AlertDescription>{updateBank.error.message}</AlertDescription>
          </Alert>
        )}

        <FieldGroup>
          <form.Field name='bankName'>
            {(field) => {
              const errors = getFieldErrorMessages(field.state.meta.errors)
              const isInvalid = field.state.meta.isTouched && errors.length > 0
              const isOtherSelected = isOtherBankSelected || isCustomBankName(field.state.value)
              const selectValue = isOtherSelected ? OTHER_BANK_VALUE : field.state.value
              return (
                <>
                  <Field data-invalid={(!isOtherSelected && isInvalid) || undefined}>
                    <FieldLabel htmlFor='bank-name-select'>Nama bank penerima</FieldLabel>
                    <Select
                      value={selectValue}
                      onValueChange={(value) => {
                        if (!value) return
                        if (value === OTHER_BANK_VALUE) {
                          setIsOtherBankSelected(true)
                          field.handleChange(
                            isCustomBankName(field.state.value) ? field.state.value : ''
                          )
                          return
                        }
                        setIsOtherBankSelected(false)
                        field.handleChange(value)
                      }}
                    >
                      <SelectTrigger
                        id='bank-name-select'
                        aria-invalid={(!isOtherSelected && isInvalid) || undefined}
                      >
                        <SelectValue placeholder='Pilih bank'>
                          {selectValue ? getBankOptionLabel(selectValue) : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {bankOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {!isOtherSelected && isInvalid && <FieldError errors={errors} />}
                  </Field>

                  {isOtherSelected && (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor='bank-name-custom'>Nama bank lainnya</FieldLabel>
                      <Input
                        id='bank-name-custom'
                        name={field.name}
                        placeholder='Contoh: Bank CIMB Niaga'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(formatBankNameInput(event.target.value))
                        }
                        maxLength={60}
                        aria-invalid={isInvalid || undefined}
                      />
                      <FieldDescription>
                        Tulis nama bank sesuai buku tabungan Anda.
                      </FieldDescription>
                      {isInvalid && <FieldError errors={errors} />}
                    </Field>
                  )}
                </>
              )
            }}
          </form.Field>

          <form.Field name='accountNumber'>
            {(field) => {
              const errors = getFieldErrorMessages(field.state.meta.errors)
              const isInvalid = field.state.meta.isTouched && errors.length > 0
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor='bank-account-number'>Nomor rekening</FieldLabel>
                  <Input
                    id='bank-account-number'
                    name={field.name}
                    inputMode='numeric'
                    placeholder='Contoh: 123401002345501'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value.replace(/\D/g, ''))}
                    maxLength={20}
                    aria-invalid={isInvalid || undefined}
                  />
                  <FieldDescription>8 sampai 20 angka tanpa spasi.</FieldDescription>
                  {isInvalid && <FieldError errors={errors} />}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name='accountHolderName'>
            {(field) => {
              const errors = getFieldErrorMessages(field.state.meta.errors)
              const isInvalid = field.state.meta.isTouched && errors.length > 0
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor='bank-holder-name'>Nama pemilik rekening</FieldLabel>
                  <Input
                    id='bank-holder-name'
                    name={field.name}
                    placeholder='Sesuai buku tabungan'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    maxLength={120}
                    aria-invalid={isInvalid || undefined}
                  />
                  {isInvalid && <FieldError errors={errors} />}
                </Field>
              )
            }}
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
              <Button type='submit' disabled={isSubmitting || updateBank.isPending}>
                {(isSubmitting || updateBank.isPending) && <Spinner data-icon='inline-start' />}
                <span>Simpan rekening</span>
              </Button>
            )}
          </form.Subscribe>
        </div>
      </SheetFooter>
    </form>
  )
}

export function BankAccountSheet({
  open,
  onOpenChange,
  initialAccount,
  onSaved,
}: BankAccountSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Rekening penerimaan dana</SheetTitle>
        </SheetHeader>
        <BankAccountForm
          key={`${initialAccount.bankName}-${initialAccount.accountNumber}-${open}`}
          initialAccount={initialAccount}
          onSaved={() => {
            onSaved()
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
