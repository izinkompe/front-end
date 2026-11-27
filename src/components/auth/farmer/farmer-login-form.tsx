'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { FarmerAuthShell } from '@/components/auth/farmer/farmer-auth-shell'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { useLoginFarmer } from '@/hooks/api/use-auth'
import { sanitizeCallbackUrl } from '@/lib/auth/rbac'
import { LoginRequestSchema } from '@/types/api/auth'

export function FarmerLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const loginMutation = useLoginFarmer()
  const nextPath = sanitizeCallbackUrl(searchParams.get('next'), '/dashboard')

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: LoginRequestSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await loginMutation.mutateAsync(value)
        if (response.user.onboardingCompleted === false) {
          router.push('/daftar-petani?lanjut=1')
          return
        }
        router.push(nextPath)
        router.refresh()
      } catch {
        return
      }
    },
  })

  return (
    <FarmerAuthShell width='narrow'>
      <div className='flex flex-col gap-6 pt-2'>
        <div className='flex flex-col gap-2 text-center'>
          <h1 className='type-h1 font-semibold text-foreground'>Masuk ke Akun Petani</h1>
          <p className='text-base leading-relaxed text-muted-foreground'>
            Masukkan email dan kata sandi akun petani Anda untuk mengelola hasil panen dan pesanan.
          </p>
        </div>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
          className='flex flex-col gap-6'
        >
          {loginMutation.isError && (
            <Alert variant='destructive'>
              <AlertCircle />
              <AlertDescription>{loginMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <form.Field name='email'>
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor='farmer-login-email'>Alamat email</FieldLabel>
                    <Input
                      id='farmer-login-email'
                      name={field.name}
                      type='email'
                      autoComplete='email'
                      placeholder='Contoh: joko@suburmakmur.id'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid || undefined}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name='password'>
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <div className='flex items-center justify-between gap-2'>
                      <FieldLabel htmlFor='farmer-login-password'>Kata sandi</FieldLabel>
                      <Link
                        href='/bantuan'
                        className='inline-flex min-h-10 items-center rounded-sm px-1 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                      >
                        Lupa kata sandi?
                      </Link>
                    </div>
                    <InputGroup>
                      <InputGroupInput
                        id='farmer-login-password'
                        name={field.name}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete='current-password'
                        placeholder='Masukkan kata sandi Anda'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={isInvalid || undefined}
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
                      Ketuk ikon mata di kanan kolom jika ingin melihat tulisan kata sandi.
                    </FieldDescription>
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>
          </FieldGroup>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => {
              const isPending = isSubmitting || loginMutation.isPending
              return (
                <Button
                  type='submit'
                  size='lg'
                  className='w-full rounded-full'
                  disabled={isPending}
                >
                  {isPending && <Spinner data-icon='inline-start' />}
                  <span>{isPending ? 'Sedang masuk...' : 'Masuk ke Akun Petani'}</span>
                </Button>
              )
            }}
          </form.Subscribe>
        </form>

        <div className='flex flex-col items-center gap-1 pt-2 text-center text-base text-muted-foreground'>
          <p>Baru pertama kali ingin berjualan hasil panen di PanganTani?</p>
          <Link
            href='/daftar-petani'
            className='inline-flex min-h-10 items-center rounded-sm px-2 font-medium text-primary underline underline-offset-4 transition-opacity pointer-coarse:min-h-11 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            Daftar jadi petani sekarang
          </Link>
          <Link
            href='/masuk-admin'
            className='inline-flex min-h-10 items-center rounded-sm px-2 text-sm text-muted-foreground underline underline-offset-4 transition-colors pointer-coarse:min-h-11 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            Masuk sebagai Admin Operasional
          </Link>
        </div>
      </div>
    </FarmerAuthShell>
  )
}
