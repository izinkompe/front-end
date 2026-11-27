'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Mail, Phone, ShieldCheck, Sprout } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useCurrentUser, useVerifyPhone } from '@/hooks/api/use-auth'
import { VerifyPhoneRequestSchema } from '@/types/api/auth'

interface AccountVerificationViewProps {
  inDashboard?: boolean
  onEditPhone?: () => void
}

export function AccountVerificationView({
  inDashboard = false,
  onEditPhone,
}: AccountVerificationViewProps = {}) {
  const { data: currentUser } = useCurrentUser()
  const verifyPhoneMutation = useVerifyPhone()

  const otpInputRef = useRef<HTMLInputElement | null>(null)
  const [otpDialogOpen, setOtpDialogOpen] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpTouched, setOtpTouched] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [verifiedNotice, setVerifiedNotice] = useState(false)

  if (!currentUser) {
    return null
  }

  const hasPhone = currentUser.phone.trim().length >= 9
  const isPhoneVerified = Boolean(currentUser.isPhoneVerified)
  const isEmailVerified = currentUser.isEmailVerified ?? true

  const otpParsed = VerifyPhoneRequestSchema.safeParse({
    phone: currentUser.phone,
    otpCode,
  })
  const otpError = !otpParsed.success
    ? otpParsed.error.issues.find((item) => item.path[0] === 'otpCode')?.message
    : undefined
  const showOtpError = (otpTouched || submitAttempted) && Boolean(otpError)

  function openVerifyDialog() {
    setOtpCode('')
    setOtpTouched(false)
    setSubmitAttempted(false)
    setVerifiedNotice(false)
    setOtpDialogOpen(true)
  }

  async function handleVerifyPhone() {
    if (!currentUser) return
    setSubmitAttempted(true)
    setOtpTouched(true)

    if (!otpParsed.success) {
      otpInputRef.current?.focus()
      return
    }

    await verifyPhoneMutation.mutateAsync({
      phone: currentUser.phone,
      otpCode: otpCode.trim(),
    })

    setOtpDialogOpen(false)
    setVerifiedNotice(true)
  }

  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Kontak &amp; Verifikasi</CardTitle>
          <CardDescription>
            Verifikasi kontak menjaga keamanan akun dan memudahkan koordinasi pengambilan panen.
          </CardDescription>
        </CardHeader>

        <CardContent className='flex flex-col gap-4'>
          {verifiedNotice && (
            <Alert>
              <CheckCircle2 aria-hidden='true' />
              <AlertDescription role='status' aria-live='polite'>
                Nomor WhatsApp berhasil diverifikasi.
              </AlertDescription>
            </Alert>
          )}

          <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4'>
            <div className='flex min-w-0 items-start gap-3'>
              <Mail className='mt-0.5 size-5 shrink-0 text-primary' aria-hidden='true' />
              <div className='flex min-w-0 flex-col gap-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='font-semibold text-foreground'>Alamat email</p>
                  <Badge variant={isEmailVerified ? 'default' : 'secondary'}>
                    {isEmailVerified ? 'Terverifikasi' : 'Belum verifikasi'}
                  </Badge>
                </div>
                <p className='truncate text-sm text-muted-foreground'>{currentUser.email}</p>
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4'>
            <div className='flex min-w-0 items-start gap-3'>
              <Phone className='mt-0.5 size-5 shrink-0 text-primary' aria-hidden='true' />
              <div className='flex min-w-0 flex-col gap-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='font-semibold text-foreground'>Nomor WhatsApp</p>
                  <Badge variant={isPhoneVerified ? 'default' : 'secondary'}>
                    {isPhoneVerified
                      ? 'Terverifikasi'
                      : hasPhone
                        ? 'Belum verifikasi'
                        : 'Belum diisi'}
                  </Badge>
                </div>
                <p className='text-sm text-muted-foreground tabular-nums'>
                  {hasPhone ? currentUser.phone : 'Tambahkan nomor WhatsApp di Data Profil'}
                </p>
              </div>
            </div>

            {hasPhone ? (
              !isPhoneVerified && (
                <Button type='button' size='sm' onClick={openVerifyDialog}>
                  Verifikasi nomor
                </Button>
              )
            ) : onEditPhone ? (
              <Button type='button' variant='outline' size='sm' onClick={onEditPhone}>
                Isi nomor
              </Button>
            ) : (
              <Button
                variant='outline'
                size='sm'
                nativeButton={false}
                render={<Link href='/akun/profil' />}
              >
                Isi nomor
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentUser.role === 'farmer' ? 'Status Verifikasi Petani' : 'Kemitraan Petani'}
          </CardTitle>
        </CardHeader>

        <CardContent className='flex flex-col gap-4'>
          {currentUser.role === 'farmer' ? (
            <div className='flex flex-col gap-4'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='flex items-center gap-2.5'>
                  <ShieldCheck className='size-5 text-primary' aria-hidden='true' />
                  <span className='font-medium text-foreground'>
                    Verifikasi identitas dan lahan
                  </span>
                </div>
                <Badge variant={currentUser.isVerifiedFarmer ? 'default' : 'secondary'}>
                  {currentUser.isVerifiedFarmer ? 'Terverifikasi' : 'Menunggu tinjauan'}
                </Badge>
              </div>

              {currentUser.bankAccount && (
                <dl className='grid grid-cols-1 gap-3 pt-2 text-sm sm:grid-cols-3'>
                  <div className='flex flex-col gap-0.5'>
                    <dt className='text-xs text-muted-foreground'>Bank penerima</dt>
                    <dd className='font-medium text-foreground'>
                      {currentUser.bankAccount.bankName}
                    </dd>
                  </div>
                  <div className='flex flex-col gap-0.5'>
                    <dt className='text-xs text-muted-foreground'>Nomor rekening</dt>
                    <dd className='font-medium text-foreground tabular-nums'>
                      {currentUser.bankAccount.accountNumber}
                    </dd>
                  </div>
                  <div className='flex flex-col gap-0.5'>
                    <dt className='text-xs text-muted-foreground'>Atas nama</dt>
                    <dd className='font-medium text-foreground'>
                      {currentUser.bankAccount.accountHolderName}
                    </dd>
                  </div>
                </dl>
              )}

              {!inDashboard && (
                <div className='flex justify-end'>
                  <Button
                    variant='outline'
                    size='sm'
                    nativeButton={false}
                    render={<Link href='/dashboard' />}
                  >
                    Buka Dashboard Mitra
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-start gap-3'>
                <Sprout className='mt-0.5 size-5 shrink-0 text-primary' aria-hidden='true' />
                <div className='flex flex-col gap-1'>
                  <p className='font-medium text-foreground'>
                    Ingin menyalurkan hasil panen di PanganTani?
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Daftarkan lahan atau kelompok tani Anda untuk membuka penawaran panen surplus.
                  </p>
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                nativeButton={false}
                render={<Link href='/daftar-petani' />}
              >
                Daftar jadi petani
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className='gap-5 p-6 sm:max-w-md'>
          <DialogHeader className='gap-1.5 pr-10'>
            <DialogTitle>Verifikasi nomor WhatsApp</DialogTitle>
            <DialogDescription>
              Masukkan 6 digit kode verifikasi yang dikirim ke {currentUser.phone}.
            </DialogDescription>
          </DialogHeader>

          {verifyPhoneMutation.isError && (
            <Alert variant='destructive'>
              <AlertDescription>{verifyPhoneMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field data-invalid={showOtpError || undefined}>
              <FieldLabel htmlFor='verify-otp-code'>Kode verifikasi</FieldLabel>
              <FieldDescription id='verify-otp-hint'>
                Untuk simulasi lokal, masukkan 6 angka seperti 123456.
              </FieldDescription>
              <Input
                ref={otpInputRef}
                id='verify-otp-code'
                name='otpCode'
                type='text'
                inputMode='numeric'
                autoComplete='one-time-code'
                maxLength={6}
                placeholder='123456'
                value={otpCode}
                onBlur={() => setOtpTouched(true)}
                onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                aria-invalid={showOtpError}
                aria-describedby={
                  showOtpError ? 'verify-otp-hint verify-otp-error' : 'verify-otp-hint'
                }
                className='tabular-nums'
              />
              {showOtpError && (
                <FieldError id='verify-otp-error' errors={[{ message: otpError as string }]} />
              )}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOtpDialogOpen(false)}
              disabled={verifyPhoneMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type='button'
              onClick={handleVerifyPhone}
              disabled={verifyPhoneMutation.isPending}
            >
              {verifyPhoneMutation.isPending && <Spinner data-icon='inline-start' />}
              <span>{verifyPhoneMutation.isPending ? 'Memverifikasi...' : 'Verifikasi'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
