'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { FarmerAuthShell } from '@/components/auth/farmer/farmer-auth-shell'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { useLoginAdmin } from '@/hooks/api/use-auth'
import { sanitizeCallbackUrl } from '@/lib/auth/rbac'
import { LoginRequestSchema } from '@/types/api/auth'

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const loginMutation = useLoginAdmin()
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
      await loginMutation.mutateAsync(value)
      router.push(nextPath)
      router.refresh()
    },
  })

  return (
    <FarmerAuthShell width='narrow'>
      <div className='flex flex-col gap-6 pt-2'>
        <div className='flex flex-col gap-2 text-center'>
          <h1 className='text-[clamp(1.5rem,1.25rem+1vw,2rem)] leading-tight font-semibold text-foreground'>
            Masuk Admin Operasional
          </h1>
          <p className='text-base leading-relaxed text-muted-foreground'>
            Gunakan akun admin PanganTani untuk verifikasi petani, moderasi, dan audit distribusi.
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
                    <FieldLabel htmlFor='admin-login-email'>Email admin</FieldLabel>
                    <Input
                      id='admin-login-email'
                      name={field.name}
                      type='email'
                      autoComplete='email'
                      placeholder='admin@pangantani.id'
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
                    <FieldLabel htmlFor='admin-login-password'>Kata sandi</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id='admin-login-password'
                        name={field.name}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete='current-password'
                        placeholder='Masukkan kata sandi admin'
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
                  <span>{isPending ? 'Sedang masuk...' : 'Masuk Dashboard Admin'}</span>
                </Button>
              )
            }}
          </form.Subscribe>
        </form>

        <Separator />

        <div className='flex flex-col items-center gap-1 text-center text-base text-muted-foreground'>
          <p>Ingin masuk sebagai petani mitra?</p>
          <Link
            href='/masuk-petani'
            className='inline-flex min-h-10 items-center rounded-sm px-2 font-medium text-primary underline underline-offset-4 transition-opacity pointer-coarse:min-h-11 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            Masuk ke Akun Petani
          </Link>
        </div>
      </div>
    </FarmerAuthShell>
  )
}
