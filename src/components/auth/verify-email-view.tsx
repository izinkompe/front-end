'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, CheckCircle2, Lock, MailCheck, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  useCurrentUser,
  useResendVerificationEmail,
  useSendEmailOtp,
  useVerifyEmailOtp,
  useVerifyEmailUrl,
} from '@/hooks/api/use-auth'
import { useHydrated } from '@/hooks/use-hydrated'
import { getDefaultDashboardPath } from '@/lib/auth/rbac'

export function VerifyEmailView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isHydrated = useHydrated()
  const { data: currentUser, isPending: isAuthPending, isError, error, refetch } = useCurrentUser()
  const verificationUrl = searchParams.get('verification_url')
  const [otpCode, setOtpCode] = useState('')
  const attemptedUrlRef = useRef<string | null>(null)

  const verifyUrl = useVerifyEmailUrl()
  const resendLink = useResendVerificationEmail()
  const sendOtp = useSendEmailOtp()
  const verifyOtp = useVerifyEmailOtp()

  const isAlreadyVerified = Boolean(
    currentUser && (currentUser.isEmailVerified === true || currentUser.emailVerifiedAt)
  )
  const targetHome = getDefaultDashboardPath(currentUser?.role)

  useEffect(() => {
    if (!isHydrated || isAuthPending || !isAlreadyVerified) return
    router.replace(targetHome)
  }, [isHydrated, isAuthPending, isAlreadyVerified, targetHome, router])

  useEffect(() => {
    if (!isHydrated || isAuthPending || !currentUser || isAlreadyVerified) return
    if (verificationUrl && attemptedUrlRef.current !== verificationUrl) {
      attemptedUrlRef.current = verificationUrl
      verifyUrl.mutate(verificationUrl)
    }
  }, [isHydrated, isAuthPending, currentUser, isAlreadyVerified, verificationUrl, verifyUrl])

  if (!isHydrated || isAuthPending) {
    return <Skeleton className='mx-auto my-12 h-80 w-full max-w-md' />
  }

  if (isError) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Terjadi kesalahan saat memverifikasi sesi akun Anda.'

    return (
      <div className='container mx-auto flex min-h-[70dvh] max-w-md items-center justify-center px-4 py-12'>
        <Card className='w-full border-destructive/30'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-xl'>
              <AlertCircle className='size-5 text-destructive' />
              Verifikasi sesi gagal
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2'>
            <Button
              type='button'
              onClick={() => {
                void refetch()
              }}
            >
              <RefreshCw className='mr-2 size-4' />
              Coba Lagi
            </Button>
            <Button variant='outline' nativeButton={false} render={<Link href='/' />}>
              Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentUser) {
    const currentPath = verificationUrl
      ? `/verify-email?verification_url=${encodeURIComponent(verificationUrl)}`
      : '/verify-email'
    const encodedNext = encodeURIComponent(currentPath)

    return (
      <div className='container mx-auto flex min-h-[70dvh] max-w-md items-center justify-center px-4 py-12'>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-xl'>
              <Lock className='size-5 text-primary' />
              Masuk untuk verifikasi email
            </CardTitle>
            <CardDescription>
              Silakan masuk terlebih dahulu sebelum memverifikasi alamat email akun PanganTani Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2'>
            <Button nativeButton={false} render={<Link href={`/masuk?next=${encodedNext}`} />}>
              Masuk Pembeli
            </Button>
            <Button
              variant='outline'
              nativeButton={false}
              render={<Link href={`/masuk-petani?next=${encodedNext}`} />}
            >
              Masuk Petani
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isAlreadyVerified) {
    return (
      <div className='container mx-auto flex min-h-[70dvh] max-w-md items-center justify-center px-4 py-12'>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-xl'>
              <CheckCircle2 className='size-5 text-primary' />
              Email sudah terverifikasi
            </CardTitle>
            <CardDescription>
              Email akun Anda sudah terverifikasi. Mengalihkan ke halaman utama...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type='button' className='w-full' onClick={() => router.replace(targetHome)}>
              Lanjutkan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isVerified = verifyUrl.isSuccess || verifyOtp.isSuccess

  return (
    <div className='container mx-auto flex min-h-[70dvh] max-w-md items-center justify-center px-4 py-12'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <MailCheck className='size-5 text-primary' />
            Verifikasi Email
          </CardTitle>
          <CardDescription>
            Selesaikan verifikasi email untuk mengaktifkan seluruh fitur akun PanganTani.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {verifyUrl.isPending && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Spinner className='size-4' />
              Memverifikasi tautan email Anda...
            </div>
          )}

          {isVerified && (
            <Alert>
              <CheckCircle2 className='size-4' />
              <AlertTitle>Email berhasil diverifikasi</AlertTitle>
              <AlertDescription className='space-y-3'>
                <p>Akun Anda kini aktif dan siap digunakan.</p>
                <Button type='button' className='w-full' onClick={() => router.replace(targetHome)}>
                  Lanjutkan
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {verifyUrl.isError && (
            <Alert variant='destructive'>
              <AlertTitle>Verifikasi tautan gagal</AlertTitle>
              <AlertDescription>{verifyUrl.error.message}</AlertDescription>
            </Alert>
          )}

          {!isVerified && (
            <>
              <div className='space-y-2'>
                <Label htmlFor='email-otp-code'>Kode OTP 6 Digit</Label>
                <div className='flex gap-2'>
                  <Input
                    id='email-otp-code'
                    inputMode='numeric'
                    maxLength={6}
                    placeholder='123456'
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                  <Button
                    type='button'
                    disabled={otpCode.length !== 6 || verifyOtp.isPending}
                    onClick={() => verifyOtp.mutate({ code: otpCode })}
                  >
                    {verifyOtp.isPending ? 'Memeriksa...' : 'Verifikasi'}
                  </Button>
                </div>
                {verifyOtp.isError && (
                  <p className='text-sm text-destructive'>{verifyOtp.error.message}</p>
                )}
              </div>

              {sendOtp.isSuccess && (
                <p className='text-sm text-muted-foreground'>
                  Kode OTP telah dikirim ke email Anda.
                </p>
              )}
              {sendOtp.isError && (
                <p className='text-sm text-destructive'>{sendOtp.error.message}</p>
              )}
              {resendLink.isSuccess && (
                <p className='text-sm text-muted-foreground'>
                  Tautan verifikasi baru telah dikirim ke email Anda.
                </p>
              )}
              {resendLink.isError && (
                <p className='text-sm text-destructive'>{resendLink.error.message}</p>
              )}

              <div className='flex flex-col gap-2 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  disabled={sendOtp.isPending}
                  onClick={() => sendOtp.mutate()}
                >
                  {sendOtp.isPending ? 'Mengirim OTP...' : 'Kirim Kode OTP ke Email'}
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  disabled={resendLink.isPending}
                  onClick={() => resendLink.mutate()}
                >
                  <RefreshCw className='mr-2 size-4' />
                  {resendLink.isPending ? 'Mengirim ulang...' : 'Kirim Ulang Tautan Verifikasi'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
