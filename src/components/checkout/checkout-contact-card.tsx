import type { RefObject } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { CheckoutContactErrors } from '@/lib/data/checkout-helpers'

interface CheckoutContactCardProps {
  contactName: string
  contactPhone: string
  contactNameRef: RefObject<HTMLInputElement | null>
  contactPhoneRef: RefObject<HTMLInputElement | null>
  contactErrors: CheckoutContactErrors
  showNameError: boolean
  showPhoneError: boolean
  onNameBlur: () => void
  onPhoneBlur: () => void
  onNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
}

export function CheckoutContactCard({
  contactName,
  contactPhone,
  contactNameRef,
  contactPhoneRef,
  contactErrors,
  showNameError,
  showPhoneError,
  onNameBlur,
  onPhoneBlur,
  onNameChange,
  onPhoneChange,
}: CheckoutContactCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Penanggung jawab pengambilan</CardTitle>
        <CardDescription>
          Digunakan petani dan admin untuk koordinasi saat serah terima panen.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <Field data-invalid={showNameError || undefined}>
            <FieldLabel htmlFor='checkout-contact-name'>Nama lengkap pengambil</FieldLabel>
            <Input
              ref={contactNameRef}
              id='checkout-contact-name'
              name='contactName'
              type='text'
              autoComplete='name'
              enterKeyHint='next'
              required
              placeholder='Contoh: Ibu Ratna Sari'
              value={contactName}
              onBlur={onNameBlur}
              onChange={(event) => onNameChange(event.target.value)}
              aria-describedby={showNameError ? 'checkout-contact-name-error' : undefined}
              aria-invalid={showNameError || undefined}
            />
            {showNameError && (
              <FieldError
                id='checkout-contact-name-error'
                errors={[{ message: contactErrors.contactName as string }]}
              />
            )}
          </Field>

          <Field data-invalid={showPhoneError || undefined}>
            <FieldLabel htmlFor='checkout-contact-phone'>Nomor telepon atau WhatsApp</FieldLabel>
            <FieldDescription id='checkout-contact-phone-hint'>
              Format nomor Indonesia aktif, contoh: 081234567890.
            </FieldDescription>
            <Input
              ref={contactPhoneRef}
              id='checkout-contact-phone'
              name='contactPhone'
              type='tel'
              autoComplete='tel'
              inputMode='tel'
              enterKeyHint='done'
              required
              placeholder='081234567890'
              value={contactPhone}
              onBlur={onPhoneBlur}
              onChange={(event) => onPhoneChange(event.target.value)}
              aria-describedby={
                showPhoneError
                  ? 'checkout-contact-phone-hint checkout-contact-phone-error'
                  : 'checkout-contact-phone-hint'
              }
              aria-invalid={showPhoneError || undefined}
            />
            {showPhoneError && (
              <FieldError
                id='checkout-contact-phone-error'
                errors={[{ message: contactErrors.contactPhone as string }]}
              />
            )}
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
