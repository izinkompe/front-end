'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, LogOut } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useCurrentUser, useLogout, useUpdateProfile } from '@/hooks/api/use-auth'
import { DEFAULT_ACCOUNT_PREFERENCES } from '@/lib/data/profile-helpers'
import type { AccountPreferences } from '@/types/api/auth'

export function AccountSettingsView() {
  const router = useRouter()
  const { data: currentUser } = useCurrentUser()
  const updateProfileMutation = useUpdateProfile()
  const logoutMutation = useLogout()

  const initialPreferences = currentUser?.preferences ?? DEFAULT_ACCOUNT_PREFERENCES
  const [preferences, setPreferences] = useState<AccountPreferences>(initialPreferences)
  const [savedNotice, setSavedNotice] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  if (!currentUser) {
    return null
  }

  function updatePref<K extends keyof AccountPreferences>(key: K, value: boolean) {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    setSavedNotice(false)
  }

  async function handleSavePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!currentUser) return
    setSavedNotice(false)
    await updateProfileMutation.mutateAsync({
      name: currentUser.name,
      preferences,
    })
    setSavedNotice(true)
  }

  async function handleLogout() {
    await logoutMutation.mutateAsync()
    setLogoutDialogOpen(false)
    router.push('/')
  }

  return (
    <div className='flex flex-col gap-6'>
      <form onSubmit={handleSavePreferences}>
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
              <Field orientation='horizontal' className='justify-between gap-4'>
                <FieldContent>
                  <FieldLabel htmlFor='pref-order-updates'>Pembaruan status pesanan</FieldLabel>
                  <FieldDescription>
                    Kirim pemberitahuan saat pembayaran diverifikasi atau panen siap diambil.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id='pref-order-updates'
                  checked={preferences.orderStatusUpdates}
                  onCheckedChange={(checked) => updatePref('orderStatusUpdates', checked)}
                />
              </Field>

              <Separator />

              <Field orientation='horizontal' className='justify-between gap-4'>
                <FieldContent>
                  <FieldLabel htmlFor='pref-harvest-reminders'>
                    Pengingat batas penawaran
                  </FieldLabel>
                  <FieldDescription>
                    Ingatkan ketika komoditas di daftar favorit mendekati batas waktu pesan.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id='pref-harvest-reminders'
                  checked={preferences.harvestReminders}
                  onCheckedChange={(checked) => updatePref('harvestReminders', checked)}
                />
              </Field>

              <Separator />

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
                  checked={preferences.showOrganizationOnReceipts}
                  onCheckedChange={(checked) => updatePref('showOrganizationOnReceipts', checked)}
                />
              </Field>

              <Separator />

              <Field orientation='horizontal' className='justify-between gap-4'>
                <FieldContent>
                  <FieldLabel htmlFor='pref-marketing'>Ringkasan panen mingguan</FieldLabel>
                  <FieldDescription>
                    Terima informasi stok panen surplus terbaru melalui email terdaftar.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id='pref-marketing'
                  checked={preferences.marketingEmails}
                  onCheckedChange={(checked) => updatePref('marketingEmails', checked)}
                />
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className='justify-between gap-3'>
            <Link
              href='/syarat'
              className='text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground'
            >
              Syarat &amp; Kebijakan Privasi
            </Link>

            <Button type='submit' disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending && <Spinner data-icon='inline-start' />}
              <span>{updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan pengaturan'}</span>
            </Button>
          </CardFooter>
        </Card>
      </form>

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
