'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { CheckCircle2, LogOut } from 'lucide-react'
import { AccessibilityControls } from '@/components/info/accessibility-controls'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useCurrentUser, useLogout, useUpdateProfile } from '@/hooks/api/use-auth'
import { DEFAULT_ACCOUNT_PREFERENCES } from '@/lib/data/profile-helpers'
import { ReminderRadiusSchema } from '@/types/api/auth'

export function AccountSettingsView() {
  const router = useRouter()
  const { data: currentUser } = useCurrentUser()
  const updateProfileMutation = useUpdateProfile()
  const logoutMutation = useLogout()

  const serverPreferences = currentUser?.preferences ?? DEFAULT_ACCOUNT_PREFERENCES
  const [savedNotice, setSavedNotice] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const form = useForm({
    defaultValues: serverPreferences,
    onSubmit: async ({ value }) => {
      if (!currentUser) return
      setSavedNotice(false)
      await updateProfileMutation.mutateAsync({
        name: currentUser.name,
        preferences: value,
      })
      setSavedNotice(true)
    },
  })

  if (!currentUser) {
    return null
  }

  async function handleLogout() {
    await logoutMutation.mutateAsync()
    setLogoutDialogOpen(false)
    router.push('/')
  }

  return (
    <div className='flex flex-col gap-6'>
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
            <CardTitle>Notifikasi &amp; Privasi</CardTitle>
          </CardHeader>

          <CardContent className='flex flex-col gap-5'>
            {updateProfileMutation.isError && (
              <Alert variant='destructive'>
                <AlertDescription>{updateProfileMutation.error.message}</AlertDescription>
              </Alert>
            )}

            {savedNotice && (
              <Alert>
                <CheckCircle2 aria-hidden='true' />
                <AlertDescription role='status' aria-live='polite'>
                  Pengaturan notifikasi dan privasi disimpan.
                </AlertDescription>
              </Alert>
            )}

            <FieldGroup>
              <form.Field name='orderStatusUpdates'>
                {(field) => (
                  <Field orientation='horizontal' className='justify-between gap-4'>
                    <FieldContent>
                      <FieldLabel htmlFor='pref-order-updates'>Pembaruan status pesanan</FieldLabel>
                      <FieldDescription>
                        Kirim pemberitahuan saat pembayaran diverifikasi atau panen siap diambil.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id='pref-order-updates'
                      checked={field.state.value}
                      onCheckedChange={(checked) => {
                        field.handleChange(checked)
                        setSavedNotice(false)
                      }}
                    />
                  </Field>
                )}
              </form.Field>

              <Separator />

              <form.Field name='harvestReminders'>
                {(field) => (
                  <Field orientation='horizontal' className='justify-between gap-4'>
                    <FieldContent>
                      <FieldLabel htmlFor='pref-harvest-reminders'>
                        Pengingat penawaran baru
                      </FieldLabel>
                      <FieldDescription>
                        Beri tahu saya saat ada penawaran baru dari petani yang saya ikuti atau
                        kategori favorit dalam radius pilihan.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id='pref-harvest-reminders'
                      checked={field.state.value}
                      onCheckedChange={(checked) => {
                        field.handleChange(checked)
                        setSavedNotice(false)
                      }}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Subscribe selector={(state) => state.values.harvestReminders}>
                {(harvestReminders) =>
                  harvestReminders && (
                    <form.Field name='reminderRadiusKm'>
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor='pref-reminder-radius'>
                            Radius pengingat dari alamat utama
                          </FieldLabel>
                          <Select
                            value={String(field.state.value ?? 10)}
                            onValueChange={(value) => {
                              if (value !== null) {
                                field.handleChange(ReminderRadiusSchema.parse(Number(value)))
                                setSavedNotice(false)
                              }
                            }}
                          >
                            <SelectTrigger id='pref-reminder-radius'>
                              <SelectValue>{field.state.value ?? 10} km</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {[5, 10, 25, 50].map((radius) => (
                                  <SelectItem key={radius} value={String(radius)}>
                                    {radius} km
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FieldDescription>
                            Jarak dihitung dalam garis lurus. Tambahkan alamat utama untuk memakai
                            pengingat.
                          </FieldDescription>
                        </Field>
                      )}
                    </form.Field>
                  )
                }
              </form.Subscribe>

              <Separator />

              <form.Field name='showOrganizationOnReceipts'>
                {(field) => (
                  <Field orientation='horizontal' className='justify-between gap-4'>
                    <FieldContent>
                      <FieldLabel htmlFor='pref-show-org'>
                        Tampilkan nama organisasi pada nota
                      </FieldLabel>
                      <FieldDescription>
                        Sertakan nama usaha atau lembaga Anda pada rincian pesanan petani.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id='pref-show-org'
                      checked={field.state.value}
                      onCheckedChange={(checked) => {
                        field.handleChange(checked)
                        setSavedNotice(false)
                      }}
                    />
                  </Field>
                )}
              </form.Field>

              <Separator />

              <form.Field name='marketingEmails'>
                {(field) => (
                  <Field orientation='horizontal' className='justify-between gap-4'>
                    <FieldContent>
                      <FieldLabel htmlFor='pref-marketing'>Ringkasan panen mingguan</FieldLabel>
                      <FieldDescription>
                        Terima informasi stok panen surplus terbaru melalui email terdaftar.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id='pref-marketing'
                      checked={field.state.value}
                      onCheckedChange={(checked) => {
                        field.handleChange(checked)
                        setSavedNotice(false)
                      }}
                    />
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className='justify-between gap-3'>
            <Link
              href='/syarat'
              className='text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground'
            >
              Syarat dan ketentuan
            </Link>

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type='submit' disabled={isSubmitting || updateProfileMutation.isPending}>
                  {(isSubmitting || updateProfileMutation.isPending) && (
                    <Spinner data-icon='inline-start' />
                  )}
                  <span>
                    {isSubmitting || updateProfileMutation.isPending
                      ? 'Menyimpan...'
                      : 'Simpan pengaturan'}
                  </span>
                </Button>
              )}
            </form.Subscribe>
          </CardFooter>
        </Card>
      </form>

      <AccessibilityControls />

      <Card>
        <CardHeader>
          <CardTitle>Sesi Akun</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-0.5'>
            <p className='font-medium text-foreground'>Keluar dari akun ini</p>
            <p className='text-sm text-muted-foreground'>
              Masuk kembali kapan saja dengan email {currentUser.email}.
            </p>
          </div>

          <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
            <AlertDialogTrigger
              render={
                <Button type='button' variant='destructive' disabled={logoutMutation.isPending} />
              }
            >
              <LogOut data-icon='inline-start' aria-hidden='true' />
              <span>Keluar</span>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Keluar dari akun PanganTani?</AlertDialogTitle>
                <AlertDialogDescription>
                  Sesi akun Anda pada peramban ini akan diakhiri.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  variant='destructive'
                  disabled={logoutMutation.isPending}
                  onClick={handleLogout}
                >
                  {logoutMutation.isPending && <Spinner data-icon='inline-start' />}
                  <span>Ya, keluar</span>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
