'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react'
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
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)

  const emailRef = useRef<HTMLInputElement | null>(null)
  const codeRef = useRef<HTMLInputElement | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  const request = useRequestPasswordReset()
  const reset = useConfirmPasswordReset()
  const sent = request.isSuccess
  const pending = request.isPending || reset.isPending

  const emailError = validateEmailInput(email)
  const codeError = sent ? validateResetCode(code) : null
  const passwordError = sent ? validateNewPassword(password) : null

  const showEmailError = Boolean((submitted || touched.email) && emailError)
  const showCodeError = Boolean((submitted || touched.code) && codeError)
  const showPasswordError = Boolean((submitted || touched.password) && passwordError)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setSubmitted(true)

    if (!sent) {
      if (emailError) {
        emailRef.current?.focus()
        return
      }
      setSubmitted(false)
      setTouched({})
      request.mutate({ email: email.trim() })
      return
    }

    if (codeError) {
      codeRef.current?.focus()
      return
    }
    if (passwordError) {
      passwordRef.current?.focus()
      return
    }

    reset.mutate({ email: email.trim(), code: code.trim(), password })
  }

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
    <form noValidate onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <FieldGroup>
        <Field data-invalid={showEmailError || undefined}>
          <FieldLabel htmlFor={id + '-email'}>Alamat email</FieldLabel>
          <Input
            ref={emailRef}
            id={id + '-email'}
            name='email'
            type='email'
            autoComplete='email'
            placeholder='nama@email.com'
            maxLength={254}
            readOnly={sent || pending}
            value={email}
            aria-invalid={showEmailError ? 'true' : 'false'}
            aria-describedby={showEmailError ? `${id}-email-error` : undefined}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            onChange={(event) => setEmail(event.target.value)}
            autoFocus={!sent}
          />
          {showEmailError && (
            <FieldError id={id + '-email-error'} errors={[{ message: emailError as string }]} />
          )}
        </Field>

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

            <Field data-invalid={showCodeError || undefined}>
              <FieldLabel htmlFor={id + '-code'}>Kode verifikasi</FieldLabel>
              <Input
                ref={codeRef}
                id={id + '-code'}
                name='code'
                inputMode='numeric'
                autoComplete='one-time-code'
                placeholder='6 digit angka'
                maxLength={6}
                value={code}
                aria-invalid={showCodeError ? 'true' : 'false'}
                aria-describedby={showCodeError ? `${id}-code-error` : undefined}
                onBlur={() => setTouched((prev) => ({ ...prev, code: true }))}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                autoFocus
              />
              {showCodeError && (
                <FieldError id={id + '-code-error'} errors={[{ message: codeError as string }]} />
              )}
            </Field>

            <Field data-invalid={showPasswordError || undefined}>
              <FieldLabel htmlFor={id + '-password'}>Kata sandi baru</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  ref={passwordRef}
                  id={id + '-password'}
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  placeholder='Minimal 8 karakter'
                  maxLength={128}
                  value={password}
                  aria-invalid={showPasswordError ? 'true' : 'false'}
                  aria-describedby={
                    showPasswordError ? `${id}-hint ${id}-password-error` : `${id}-hint`
                  }
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  onChange={(event) => setPassword(event.target.value)}
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
              {showPasswordError && (
                <FieldError
                  id={id + '-password-error'}
                  errors={[{ message: passwordError as string }]}
                />
              )}
            </Field>
          </>
        )}
      </FieldGroup>

      {(request.isError || reset.isError) && (
        <Alert variant='destructive'>
          <AlertDescription>{(request.error ?? reset.error)?.message}</AlertDescription>
        </Alert>
      )}

      <div className='flex flex-wrap gap-2'>
        <Button type='submit' disabled={pending}>
          {pending && <Spinner data-icon='inline-start' />}
          <span>{sent ? 'Simpan kata sandi baru' : 'Minta kode reset'}</span>
        </Button>
        {sent && (
          <Button
            type='button'
            variant='outline'
            disabled={pending}
            onClick={() => {
              request.reset()
              reset.reset()
              setCode('')
              setPassword('')
              setTouched({})
              setSubmitted(false)
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
