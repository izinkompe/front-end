'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { BuyerPasswordResetForm } from '@/components/auth/buyer-password-reset-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLogin, useRegisterBuyer } from '@/hooks/api/use-auth'
import { sanitizeCallbackUrl } from '@/lib/auth/rbac'
import { useAuthStore } from '@/stores/use-auth-store'
import {
  BuyerRegisterRequestSchema,
  LoginRequestSchema,
  type BuyerRegisterRequest,
  type User,
} from '@/types/api/auth'

function getFieldErrorMessages(errors: unknown[]): Array<{ message: string }> {
  return errors
    .map((error) => {
      if (typeof error === 'string') return { message: error }
      if (error && typeof error === 'object' && 'message' in error) {
        return { message: String((error as { message?: unknown }).message) }
      }
      return undefined
    })
    .filter((item): item is { message: string } => Boolean(item?.message))
}

function getSafeAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export function BuyerAuthPageView({ defaultTab = 'login' }: { defaultTab?: 'login' | 'register' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = sanitizeCallbackUrl(searchParams.get('next'), '/')

  const [tab, setTab] = useState<'login' | 'register' | 'reset'>(defaultTab)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  const login = useLogin()
  const register = useRegisterBuyer()
  const setRegisterDraft = useAuthStore((state) => state.setRegisterDraft)
  const clearRegisterDraft = useAuthStore((state) => state.clearRegisterDraft)

  const handleAuthSuccess = (user: User) => {
    if (user.emailVerifiedAt === null || user.isEmailVerified === false) {
      router.push('/verify-email')
      return
    }
    router.push(nextPath)
  }

  const loginForm = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: LoginRequestSchema },
    onSubmit: async ({ value }) => {
      try {
        const data = await login.mutateAsync(value)
        handleAuthSuccess(data.user)
      } catch {
        return
      }
    },
  })

  const registerForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    } as BuyerRegisterRequest,
    validators: { onSubmit: BuyerRegisterRequestSchema },
    onSubmit: async ({ value }) => {
      try {
        const data = await register.mutateAsync({ ...value, role: 'buyer' })
        clearRegisterDraft()
        handleAuthSuccess(data.user)
      } catch {
        return
      }
    },
  })

  useEffect(() => {
    const syncDraft = () => {
      const draft = useAuthStore.getState().registerDraft
      if (draft.name) {
        registerForm.setFieldValue('name', draft.name)
      }
      if (draft.email) {
        registerForm.setFieldValue('email', draft.email)
      }
    }

    if (useAuthStore.persist.hasHydrated()) {
      syncDraft()
      return
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      syncDraft()
    })
    return () => {
      unsub()
    }
  }, [registerForm])

  return (
    <div className='container mx-auto flex min-h-[75dvh] max-w-md items-center justify-center px-4 py-10'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-xl'>
            {tab === 'login' && 'Masuk ke PanganTani'}
            {tab === 'register' && 'Daftar Akun Pembeli'}
            {tab === 'reset' && 'Reset Kata Sandi'}
          </CardTitle>
          <CardDescription>
            {tab === 'login' && 'Masuk untuk melanjutkan belanja hasil panen langsung dari petani.'}
            {tab === 'register' && 'Buat akun pembeli baru untuk memesan komoditas segar.'}
            {tab === 'reset' && 'Atur ulang kata sandi akun PanganTani Anda.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tab === 'reset' ? (
            <BuyerPasswordResetForm onBack={() => setTab('login')} />
          ) : (
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')}>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='login'>Masuk</TabsTrigger>
                <TabsTrigger value='register'>Daftar</TabsTrigger>
              </TabsList>

              <TabsContent value='login' className='mt-4'>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    loginForm.handleSubmit()
                  }}
                  className='space-y-4'
                >
                  {login.isError && (
                    <Alert variant='destructive'>
                      <AlertCircle className='size-4' />
                      <AlertDescription>
                        {getSafeAuthErrorMessage(login.error, 'Email atau kata sandi salah.')}
                      </AlertDescription>
                    </Alert>
                  )}
                  <FieldGroup>
                    <loginForm.Field name='email'>
                      {(field) => (
                        <Field data-invalid={field.state.meta.errors.length > 0}>
                          <FieldLabel htmlFor='login-email'>Email</FieldLabel>
                          <Input
                            id='login-email'
                            type='email'
                            autoComplete='email'
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const nextEmail = e.target.value
                              field.handleChange(nextEmail)
                              setRegisterDraft({ email: nextEmail })
                            }}
                            placeholder='budi@email.com'
                          />
                          <FieldError errors={getFieldErrorMessages(field.state.meta.errors)} />
                        </Field>
                      )}
                    </loginForm.Field>
                    <loginForm.Field name='password'>
                      {(field) => (
                        <Field data-invalid={field.state.meta.errors.length > 0}>
                          <FieldLabel htmlFor='login-password'>Kata Sandi</FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              id='login-password'
                              type={showLoginPassword ? 'text' : 'password'}
                              autoComplete='current-password'
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder='Masukkan kata sandi'
                            />
                            <InputGroupAddon align='inline-end'>
                              <InputGroupButton
                                aria-label='Tampilkan kata sandi'
                                onClick={() => setShowLoginPassword((prev) => !prev)}
                              >
                                {showLoginPassword ? (
                                  <EyeOff className='size-4' />
                                ) : (
                                  <Eye className='size-4' />
                                )}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                          <FieldError errors={getFieldErrorMessages(field.state.meta.errors)} />
                        </Field>
                      )}
                    </loginForm.Field>
                  </FieldGroup>

                  <div className='flex justify-end'>
                    <Button
                      type='button'
                      variant='link'
                      className='h-auto p-0 text-sm'
                      onClick={() => setTab('reset')}
                    >
                      Lupa kata sandi?
                    </Button>
                  </div>

                  <Button type='submit' className='w-full' disabled={login.isPending}>
                    {login.isPending && <Spinner className='mr-2 size-4' />}
                    Masuk
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value='register' className='mt-4'>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    registerForm.handleSubmit()
                  }}
                  className='space-y-4'
                >
                  {register.isError && (
                    <Alert variant='destructive'>
                      <AlertCircle className='size-4' />
                      <AlertDescription>
                        {getSafeAuthErrorMessage(
                          register.error,
                          'Gagal mendaftarkan akun. Periksa kembali data Anda.'
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                  <FieldGroup>
                    <registerForm.Field name='name'>
                      {(field) => (
                        <Field data-invalid={field.state.meta.errors.length > 0}>
                          <FieldLabel htmlFor='reg-name'>Nama Lengkap</FieldLabel>
                          <Input
                            id='reg-name'
                            autoComplete='name'
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const nextName = e.target.value
                              field.handleChange(nextName)
                              setRegisterDraft({ name: nextName })
                            }}
                            placeholder='Budi Santoso'
                          />
                          <FieldError errors={getFieldErrorMessages(field.state.meta.errors)} />
                        </Field>
                      )}
                    </registerForm.Field>
                    <registerForm.Field name='email'>
                      {(field) => (
                        <Field data-invalid={field.state.meta.errors.length > 0}>
                          <FieldLabel htmlFor='reg-email'>Email</FieldLabel>
                          <Input
                            id='reg-email'
                            type='email'
                            autoComplete='email'
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const nextEmail = e.target.value
                              field.handleChange(nextEmail)
                              setRegisterDraft({ email: nextEmail })
                            }}
                            placeholder='budi@email.com'
                          />
                          <FieldError errors={getFieldErrorMessages(field.state.meta.errors)} />
                        </Field>
                      )}
                    </registerForm.Field>
                    <registerForm.Field name='password'>
                      {(field) => (
                        <Field data-invalid={field.state.meta.errors.length > 0}>
                          <FieldLabel htmlFor='reg-password'>Kata Sandi</FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              id='reg-password'
                              type={showRegisterPassword ? 'text' : 'password'}
                              autoComplete='new-password'
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder='Minimal 8 karakter (huruf & angka)'
                            />
                            <InputGroupAddon align='inline-end'>
                              <InputGroupButton
                                aria-label='Tampilkan kata sandi'
                                onClick={() => setShowRegisterPassword((prev) => !prev)}
                              >
                                {showRegisterPassword ? (
                                  <EyeOff className='size-4' />
                                ) : (
                                  <Eye className='size-4' />
                                )}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                          <FieldError errors={getFieldErrorMessages(field.state.meta.errors)} />
                        </Field>
                      )}
                    </registerForm.Field>
                    <registerForm.Field name='password_confirmation'>
                      {(field) => (
                        <Field data-invalid={field.state.meta.errors.length > 0}>
                          <FieldLabel htmlFor='reg-password-confirm'>Ulangi Kata Sandi</FieldLabel>
                          <Input
                            id='reg-password-confirm'
                            type={showRegisterPassword ? 'text' : 'password'}
                            autoComplete='new-password'
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder='Ulangi kata sandi'
                          />
                          <FieldError errors={getFieldErrorMessages(field.state.meta.errors)} />
                        </Field>
                      )}
                    </registerForm.Field>
                  </FieldGroup>

                  <Button type='submit' className='w-full' disabled={register.isPending}>
                    {register.isPending && <Spinner className='mr-2 size-4' />}
                    Daftar sebagai Pembeli
                  </Button>

                  <p className='text-center text-sm text-muted-foreground'>
                    Ingin berjualan hasil panen?{' '}
                    <Link href='/daftar-petani' className='font-medium text-primary underline'>
                      Daftar sebagai Petani
                    </Link>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
