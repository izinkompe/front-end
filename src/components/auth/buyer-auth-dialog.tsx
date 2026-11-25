'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { BuyerRegisterRequestSchema, LoginRequestSchema } from '@/types/api/auth'

interface BuyerAuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

function BuyerLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()

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
      onSuccess()
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
      className='flex flex-col gap-6 pt-1'
    >
      {loginMutation.isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>{loginMutation.error.message}</AlertDescription>
        </Alert>
      )}

      <FieldGroup className='gap-4'>
        <form.Field name='email'>
          {(field) => {
            const errors = getFieldErrorMessages(field.state.meta.errors)
            const isInvalid = field.state.meta.isTouched && errors.length > 0
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor='buyer-login-email'>Alamat email</FieldLabel>
                <Input
                  id='buyer-login-email'
                  name={field.name}
                  type='email'
                  autoComplete='email'
                  placeholder='nama@email.com'
                  className='h-10'
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
                  <FieldLabel htmlFor='buyer-login-password'>Kata sandi</FieldLabel>
                  <Link
                    href='/bantuan'
                    onClick={onSuccess}
                    className='rounded-sm text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  >
                    Lupa kata sandi?
                  </Link>
                </div>
                <InputGroup className='h-10'>
                  <InputGroupInput
                    id='buyer-login-password'
                    name={field.name}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    placeholder='Masukkan kata sandi'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid || undefined}
                  />
                  <InputGroupAddon align='inline-end'>
                    <InputGroupButton
                      size='icon-xs'
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
            <Button type='submit' size='lg' className='h-10 w-full' disabled={isPending}>
              {isPending && <Spinner data-icon='inline-start' />}
              <span>{isPending ? 'Memproses...' : 'Masuk'}</span>
            </Button>
          )
        }}
      </form.Subscribe>
    </form>
  )
}

function BuyerRegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const registerMutation = useRegisterBuyer()

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    validators: {
      onSubmit: BuyerRegisterRequestSchema,
    },
    onSubmit: async ({ value }) => {
      await registerMutation.mutateAsync(value)
      onSuccess()
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
      className='flex flex-col gap-6 pt-1'
    >
      {registerMutation.isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>{registerMutation.error.message}</AlertDescription>
        </Alert>
      )}

      <FieldGroup className='gap-4'>
        <form.Field name='name'>
          {(field) => {
            const errors = getFieldErrorMessages(field.state.meta.errors)
            const isInvalid = field.state.meta.isTouched && errors.length > 0
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor='buyer-register-name'>Nama lengkap</FieldLabel>
                <Input
                  id='buyer-register-name'
                  name={field.name}
                  type='text'
                  autoComplete='name'
                  placeholder='Masukkan nama lengkap'
                  className='h-10'
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

        <form.Field name='email'>
          {(field) => {
            const errors = getFieldErrorMessages(field.state.meta.errors)
            const isInvalid = field.state.meta.isTouched && errors.length > 0
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor='buyer-register-email'>Alamat email</FieldLabel>
                <Input
                  id='buyer-register-email'
                  name={field.name}
                  type='email'
                  autoComplete='email'
                  placeholder='nama@email.com'
                  className='h-10'
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
                <FieldLabel htmlFor='buyer-register-password'>Kata sandi</FieldLabel>
                <InputGroup className='h-10'>
                  <InputGroupInput
                    id='buyer-register-password'
                    name={field.name}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    placeholder='Minimal 6 karakter'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid || undefined}
                  />
                  <InputGroupAddon align='inline-end'>
                    <InputGroupButton
                      size='icon-xs'
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

      <div className='flex flex-col gap-4'>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          Dengan mendaftar, Anda menyetujui{' '}
          <Link
            href='/syarat'
            onClick={onSuccess}
            className='text-foreground underline underline-offset-4 hover:opacity-80'
          >
            Syarat &amp; Ketentuan
          </Link>{' '}
          serta{' '}
          <Link
            href='/privasi'
            onClick={onSuccess}
            className='text-foreground underline underline-offset-4 hover:opacity-80'
          >
            Kebijakan Privasi
          </Link>{' '}
          PanganTani.
        </p>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => {
            const isPending = isSubmitting || registerMutation.isPending
            return (
              <Button type='submit' size='lg' className='h-10 w-full' disabled={isPending}>
                {isPending && <Spinner data-icon='inline-start' />}
                <span>{isPending ? 'Mendaftarkan...' : 'Daftar'}</span>
              </Button>
            )
          }}
        </form.Subscribe>
      </div>
    </form>
  )
}

export function BuyerAuthDialog({ open, onOpenChange }: BuyerAuthDialogProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  function handleSuccess() {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='gap-5 p-6 sm:max-w-md'>
        <DialogHeader className='gap-1.5 pr-6'>
          <DialogTitle className='text-xl font-semibold tracking-tight'>
            Masuk ke PanganTani
          </DialogTitle>
          <DialogDescription>
            Khusus akun Pembeli untuk memesan hasil panen langsung dari petani.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'login' | 'register')}
          className='gap-5'
        >
          <TabsList
            variant='line'
            className='h-10 w-full justify-start gap-6 border-b border-border p-0'
          >
            <TabsTrigger value='login' className='flex-none px-0 pb-2 after:bottom-0'>
              Masuk
            </TabsTrigger>
            <TabsTrigger value='register' className='flex-none px-0 pb-2 after:bottom-0'>
              Daftar Baru
            </TabsTrigger>
          </TabsList>

          <TabsContent value='login'>
            <BuyerLoginForm onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value='register'>
            <BuyerRegisterForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
