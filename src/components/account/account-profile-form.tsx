'use client'

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Link from 'next/link'
import { Camera, CheckCircle2, Trash2 } from 'lucide-react'
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

export function AccountProfileForm() {
  const { data: currentUser } = useCurrentUser()
  const updateProfileMutation = useUpdateProfile()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const phoneInputRef = useRef<HTMLInputElement | null>(null)

  const [name, setName] = useState(currentUser?.name ?? '')
  const [organization, setOrganization] = useState(currentUser?.organization ?? '')
  const [phone, setPhone] = useState(currentUser?.phone ?? '')
  const [avatarDraft, setAvatarDraft] = useState<string | null | undefined>(undefined)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [touched, setTouched] = useState({ name: false, phone: false, organization: false })
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)

  if (!currentUser) {
    return null
  }

  const effectiveAvatar =
    avatarDraft === undefined ? isSafeAvatarUrl(currentUser.avatarUrl) : avatarDraft

  const errors = validateProfileFormInput({ name, phone, organization })
  const showNameError = (touched.name || submitAttempted) && Boolean(errors.name)
  const showPhoneError = (touched.phone || submitAttempted) && Boolean(errors.phone)
  const showOrgError = (touched.organization || submitAttempted) && Boolean(errors.organization)

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitAttempted(true)
    setTouched({ name: true, phone: true, organization: true })
    setSavedNotice(false)

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
      name: name.trim(),
      organization: organization.trim(),
      phone: phone.trim().replace(/[\s-]/g, ''),
      avatarUrl: avatarDraft,
    })

    setAvatarDraft(undefined)
    setSavedNotice(true)
  }

  const orgLabel =
    currentUser.role === 'farmer' ? 'Nama kebun atau kelompok tani' : 'Nama usaha atau organisasi'

  return (
    <form noValidate onSubmit={handleSubmit}>
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
            <Avatar className='size-20'>
              {effectiveAvatar && (
                <AvatarImage src={effectiveAvatar} alt={name || currentUser.name} />
              )}
              <AvatarFallback className='text-lg'>
                {getUserInitials(name || currentUser.name)}
              </AvatarFallback>
            </Avatar>

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
            <Field data-invalid={showNameError || undefined}>
              <FieldLabel htmlFor='profile-name'>Nama lengkap</FieldLabel>
              <Input
                ref={nameInputRef}
                id='profile-name'
                name='name'
                type='text'
                autoComplete='name'
                required
                value={name}
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                onChange={(event) => {
                  setName(event.target.value)
                  setSavedNotice(false)
                }}
                aria-invalid={showNameError}
                aria-describedby={showNameError ? 'profile-name-error' : undefined}
              />
              {showNameError && (
                <FieldError id='profile-name-error' errors={[{ message: errors.name as string }]} />
              )}
            </Field>

            <Field data-invalid={showOrgError || undefined}>
              <FieldLabel htmlFor='profile-organization'>{orgLabel}</FieldLabel>
              <Input
                id='profile-organization'
                name='organization'
                type='text'
                autoComplete='organization'
                placeholder='Contoh: Dapur Umum Yayasan Kasih'
                value={organization}
                onBlur={() => setTouched((prev) => ({ ...prev, organization: true }))}
                onChange={(event) => {
                  setOrganization(event.target.value)
                  setSavedNotice(false)
                }}
                aria-invalid={showOrgError}
                aria-describedby={showOrgError ? 'profile-org-error' : undefined}
              />
              {showOrgError && (
                <FieldError
                  id='profile-org-error'
                  errors={[{ message: errors.organization as string }]}
                />
              )}
            </Field>

            <Field data-invalid={showPhoneError || undefined}>
              <FieldLabel htmlFor='profile-phone'>Nomor WhatsApp</FieldLabel>
              <FieldDescription id='profile-phone-hint'>
                Format 08xxxxxxxxxx, dipakai untuk koordinasi pengambilan panen.
              </FieldDescription>
              <Input
                ref={phoneInputRef}
                id='profile-phone'
                name='phone'
                type='tel'
                inputMode='tel'
                autoComplete='tel'
                placeholder='081234567890'
                value={phone}
                onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                onChange={(event) => {
                  setPhone(event.target.value)
                  setSavedNotice(false)
                }}
                aria-invalid={showPhoneError}
                aria-describedby={
                  showPhoneError ? 'profile-phone-hint profile-phone-error' : 'profile-phone-hint'
                }
              />
              {showPhoneError && (
                <FieldError
                  id='profile-phone-error'
                  errors={[{ message: errors.phone as string }]}
                />
              )}
            </Field>

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
                <Link href='/akun/verifikasi' className='underline underline-offset-4'>
                  Kontak &amp; Verifikasi
                </Link>
                .
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className='justify-end'>
          <Button type='submit' disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending && <Spinner data-icon='inline-start' />}
            <span>{updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan perubahan'}</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
