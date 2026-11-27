'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { useForm } from '@tanstack/react-form'
import { Camera, CheckCircle2, Trash2 } from 'lucide-react'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useCurrentUser, useUpdateProfile } from '@/hooks/api/use-auth'
import {
  getUserInitials,
  isSafeAvatarUrl,
  validateProfileFormInput,
} from '@/lib/data/profile-helpers'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface AccountProfileFormProps {
  onVerificationClick?: () => void
}

export function AccountProfileForm({ onVerificationClick }: AccountProfileFormProps = {}) {
  const { data: currentUser } = useCurrentUser()
  const updateProfileMutation = useUpdateProfile()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const phoneInputRef = useRef<HTMLInputElement | null>(null)

  const [avatarDraft, setAvatarDraft] = useState<string | null | undefined>(undefined)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState(false)

  const form = useForm({
    defaultValues: {
      name: currentUser?.name ?? '',
      organization: currentUser?.organization ?? '',
      phone: currentUser?.phone ?? '',
    },
    onSubmit: async ({ value }) => {
      setSavedNotice(false)
      const errors = validateProfileFormInput(value)
      if (errors.name) {
        nameInputRef.current?.focus()
        return
      }
      if (errors.phone) {
        phoneInputRef.current?.focus()
        return
      }
      if (errors.organization) {
        return
      }

      await updateProfileMutation.mutateAsync({
        name: value.name.trim(),
        organization: value.organization.trim(),
        phone: value.phone.trim().replace(/[\s-]/g, ''),
        avatarUrl: avatarDraft,
      })

      setAvatarDraft(undefined)
      setSavedNotice(true)
    },
  })

  if (!currentUser) {
    return null
  }

  const effectiveAvatar =
    avatarDraft === undefined ? isSafeAvatarUrl(currentUser.avatarUrl) : avatarDraft

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Format foto harus JPG, PNG, atau WebP.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Ukuran foto maksimal 2 MB.')
      return
    }

    setAvatarError(null)
    setSavedNotice(false)

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const safeUrl = isSafeAvatarUrl(reader.result)
        if (safeUrl) {
          setAvatarDraft(safeUrl)
        } else {
          setAvatarError('Foto tidak dapat diproses.')
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const orgLabel =
    currentUser.role === 'farmer' ? 'Nama kebun atau kelompok tani' : 'Nama usaha atau organisasi'

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Data Profil</CardTitle>
        </CardHeader>

        <CardContent className='flex flex-col gap-6'>
          {updateProfileMutation.isError && (
            <Alert variant='destructive'>
              <AlertDescription>{updateProfileMutation.error.message}</AlertDescription>
            </Alert>
          )}

          {savedNotice && (
            <Alert>
              <CheckCircle2 aria-hidden='true' />
              <AlertDescription role='status' aria-live='polite'>
                Perubahan data profil disimpan.
              </AlertDescription>
            </Alert>
          )}

          <div className='flex flex-wrap items-center gap-4'>
            <form.Subscribe selector={(state) => state.values.name}>
              {(nameValue) => (
                <Avatar className='size-20'>
                  {effectiveAvatar && (
                    <AvatarImage src={effectiveAvatar} alt={nameValue || currentUser.name} />
                  )}
                  <AvatarFallback className='text-lg'>
                    {getUserInitials(nameValue || currentUser.name)}
                  </AvatarFallback>
                </Avatar>
              )}
            </form.Subscribe>

            <div className='flex flex-col gap-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/jpeg,image/png,image/webp'
                  onChange={handleAvatarChange}
                  className='sr-only'
                  aria-label='Unggah foto profil'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera data-icon='inline-start' aria-hidden='true' />
                  <span>Ubah foto</span>
                </Button>
                {effectiveAvatar && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setAvatarDraft(null)
                      setAvatarError(null)
                      setSavedNotice(false)
                    }}
                  >
                    <Trash2 data-icon='inline-start' aria-hidden='true' />
                    <span>Hapus foto</span>
                  </Button>
                )}
              </div>
              <p className='text-xs text-muted-foreground'>JPG, PNG, atau WebP maksimal 2 MB.</p>
              {avatarError && (
                <p className='text-xs text-destructive' role='alert'>
                  {avatarError}
                </p>
              )}
            </div>
          </div>

          <FieldGroup>
            <form.Field
              name='name'
              validators={{
                onChange: ({ value }) =>
                  validateProfileFormInput({ name: value, phone: '', organization: '' }).name ??
                  undefined,
              }}
            >
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor='profile-name'>Nama lengkap</FieldLabel>
                    <Input
                      ref={nameInputRef}
                      id='profile-name'
                      name={field.name}
                      type='text'
                      autoComplete='name'
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value)
                        setSavedNotice(false)
                      }}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? 'profile-name-error' : undefined}
                    />
                    {isInvalid && <FieldError id='profile-name-error' errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field
              name='organization'
              validators={{
                onChange: ({ value }) =>
                  validateProfileFormInput({ name: 'Valid Name', phone: '', organization: value })
                    .organization ?? undefined,
              }}
            >
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor='profile-organization'>{orgLabel}</FieldLabel>
                    <Input
                      id='profile-organization'
                      name={field.name}
                      type='text'
                      autoComplete='organization'
                      placeholder='Contoh: Dapur Umum Yayasan Kasih'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value)
                        setSavedNotice(false)
                      }}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? 'profile-org-error' : undefined}
                    />
                    {isInvalid && <FieldError id='profile-org-error' errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field
              name='phone'
              validators={{
                onChange: ({ value }) =>
                  validateProfileFormInput({ name: 'Valid Name', phone: value, organization: '' })
                    .phone ?? undefined,
              }}
            >
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor='profile-phone'>Nomor WhatsApp</FieldLabel>
                    <FieldDescription id='profile-phone-hint'>
                      Format 08xxxxxxxxxx, dipakai untuk koordinasi pengambilan panen.
                    </FieldDescription>
                    <Input
                      ref={phoneInputRef}
                      id='profile-phone'
                      name={field.name}
                      type='tel'
                      inputMode='tel'
                      autoComplete='tel'
                      placeholder='081234567890'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value)
                        setSavedNotice(false)
                      }}
                      aria-invalid={isInvalid}
                      aria-describedby={
                        isInvalid ? 'profile-phone-hint profile-phone-error' : 'profile-phone-hint'
                      }
                    />
                    {isInvalid && <FieldError id='profile-phone-error' errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <Field data-disabled>
              <FieldLabel htmlFor='profile-email'>Alamat email</FieldLabel>
              <Input
                id='profile-email'
                name='email'
                type='email'
                value={currentUser.email}
                disabled
                aria-describedby='profile-email-note'
              />
              <FieldDescription id='profile-email-note'>
                Status verifikasi kontak dapat dicek di{' '}
                {onVerificationClick ? (
                  <button
                    type='button'
                    onClick={onVerificationClick}
                    className='underline underline-offset-4'
                  >
                    Kontak &amp; Verifikasi
                  </button>
                ) : (
                  <Link href='/akun/verifikasi' className='underline underline-offset-4'>
                    Kontak &amp; Verifikasi
                  </Link>
                )}
                .
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className='justify-end'>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type='submit' disabled={isSubmitting || updateProfileMutation.isPending}>
                {(isSubmitting || updateProfileMutation.isPending) && (
                  <Spinner data-icon='inline-start' />
                )}
                <span>
                  {isSubmitting || updateProfileMutation.isPending
                    ? 'Menyimpan...'
                    : 'Simpan perubahan'}
                </span>
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </Card>
    </form>
  )
}
