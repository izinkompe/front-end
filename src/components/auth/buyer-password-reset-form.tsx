'use client'

import { useId, useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { useConfirmPasswordReset, useRequestPasswordReset } from '@/hooks/api/use-auth'
import { ForgotPasswordRequestSchema } from '@/types/api/auth'

function validateEmailInput(value: string) {
  const result = ForgotPasswordRequestSchema.safeParse({ email: value })
  if (!result.success) {
    return 'Masukkan alamat email yang valid.'
  }
  return null
}

function validateResetCode(value: string) {
  if (!/^\d{6}$/.test(value.trim())) {
    return 'Kode verifikasi harus berisi 6 digit angka.'
  }
  return null
}

function validateNewPassword(value: string) {
  if (value.length < 8) {
    return 'Kata sandi baru minimal 8 karakter.'
  }
  if (value.length > 128) {
    return 'Kata sandi maksimal 128 karakter.'
  }
  return null
}

export function BuyerPasswordResetForm({ onBack }: { onBack: () => void }) {
  const id = useId()
  const [showPassword, setShowPassword] = useState(false)

  const emailRef = useRef<HTMLInputElement | null>(null)
  const codeRef = useRef<HTMLInputElement | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  const request = useRequestPasswordReset()
  const reset = useConfirmPasswordReset()
  const sent = request.isSuccess
  const pending = request.isPending || reset.isPending

  const form = useForm({
    defaultValues: {
      email: '',
      code: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      if (pending) return

      const emailErr = validateEmailInput(value.email)
      if (!sent) {
        if (emailErr) {
          emailRef.current?.focus()
          return
        }
        request.mutate({ email: value.email.trim() })
        return
      }

      const codeErr = validateResetCode(value.code)
      if (codeErr) {
        codeRef.current?.focus()
        return
      }

      const passwordErr = validateNewPassword(value.password)
      if (passwordErr) {
        passwordRef.current?.focus()
        return
      }

      reset.mutate({ email: value.email.trim(), code: value.code.trim(), password: value.password })
    },
  })

  if (reset.isSuccess) {
    return (
      <div className='flex flex-col items-start gap-4'>
        <Alert>
          <CheckCircle2 aria-hidden='true' />
          <AlertTitle>Kata sandi berhasil diperbarui</AlertTitle>
          <AlertDescription role='status'>
            Jika email terdaftar, kata sandi baru sudah bisa langsung digunakan untuk masuk.
          </AlertDescription>
        </Alert>
        <Button autoFocus onClick={onBack}>
          Kembali masuk
        </Button>
      </div>
    )
  }

  return (
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
          name='email'
          validators={{
            onChange: ({ value }) => validateEmailInput(value) ?? undefined,
          }}
        >
          {(field) => {
            const errors = getFieldErrorMessages(field.state.meta.errors)
            const isInvalid = field.state.meta.isTouched && errors.length > 0
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={id + '-email'}>Alamat email</FieldLabel>
                <Input
                  ref={emailRef}
                  id={id + '-email'}
                  name={field.name}
                  type='email'
                  autoComplete='email'
                  placeholder='nama@email.com'
                  maxLength={254}
                  readOnly={sent || pending}
                  value={field.state.value}
                  aria-invalid={isInvalid ? 'true' : 'false'}
                  aria-describedby={isInvalid ? `${id}-email-error` : undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  autoFocus={!sent}
                />
                {isInvalid && <FieldError id={id + '-email-error'} errors={errors} />}
              </Field>
            )
          }}
        </form.Field>

        {sent && (
          <>
            <Alert>
              <KeyRound aria-hidden='true' />
              <AlertTitle>
                {request.data.demoCode ? 'Kode verifikasi demo' : 'Kode verifikasi terkirim'}
              </AlertTitle>
              <AlertDescription role='status'>
                {request.data.demoCode
                  ? `Gunakan kode ${request.data.demoCode} (berlaku 10 menit).`
                  : 'Jika email terdaftar, kode verifikasi 6 digit telah dikirim.'}
              </AlertDescription>
            </Alert>

            <form.Field
              name='code'
              validators={{
                onChange: ({ value }) =>
                  sent ? (validateResetCode(value) ?? undefined) : undefined,
              }}
            >
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={id + '-code'}>Kode verifikasi</FieldLabel>
                    <Input
                      ref={codeRef}
                      id={id + '-code'}
                      name={field.name}
                      inputMode='numeric'
                      autoComplete='one-time-code'
                      placeholder='6 digit angka'
                      maxLength={6}
                      value={field.state.value}
                      aria-invalid={isInvalid ? 'true' : 'false'}
                      aria-describedby={isInvalid ? `${id}-code-error` : undefined}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value.replace(/\D/g, ''))
                      }
                      autoFocus
                    />
                    {isInvalid && <FieldError id={id + '-code-error'} errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field
              name='password'
              validators={{
                onChange: ({ value }) =>
                  sent ? (validateNewPassword(value) ?? undefined) : undefined,
              }}
            >
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={id + '-password'}>Kata sandi baru</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        ref={passwordRef}
                        id={id + '-password'}
                        name={field.name}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete='new-password'
                        placeholder='Minimal 8 karakter'
                        maxLength={128}
                        value={field.state.value}
                        aria-invalid={isInvalid ? 'true' : 'false'}
                        aria-describedby={
                          isInvalid ? `${id}-hint ${id}-password-error` : `${id}-hint`
                        }
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
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
                    <FieldDescription id={id + '-hint'}>
                      Gunakan minimal 8 karakter untuk keamanan akun.
                    </FieldDescription>
                    {isInvalid && <FieldError id={id + '-password-error'} errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>
          </>
        )}
      </FieldGroup>

      {(request.isError || reset.isError) && (
        <Alert variant='destructive'>
          <AlertDescription>{(request.error ?? reset.error)?.message}</AlertDescription>
        </Alert>
      )}

      <div className='flex flex-wrap gap-2'>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type='submit' disabled={pending || isSubmitting}>
              {(pending || isSubmitting) && <Spinner data-icon='inline-start' />}
              <span>{sent ? 'Simpan kata sandi baru' : 'Minta kode reset'}</span>
            </Button>
          )}
        </form.Subscribe>
        {sent && (
          <Button
            type='button'
            variant='outline'
            disabled={pending}
            onClick={() => {
              request.reset()
              reset.reset()
              form.setFieldValue('code', '')
              form.setFieldValue('password', '')
            }}
          >
            Minta kode baru
          </Button>
        )}
        <Button type='button' variant='ghost' onClick={onBack}>
          Kembali masuk
        </Button>
      </div>
    </form>
  )
}
