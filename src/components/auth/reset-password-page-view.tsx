'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, KeyRound } from 'lucide-react'
import { BuyerPasswordResetForm } from '@/components/auth/buyer-password-reset-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConfirmPasswordReset } from '@/hooks/api/use-auth'
import { ResetPasswordRequestSchema } from '@/types/api/auth'

export function ResetPasswordPageView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email') ?? ''
  const tokenParam = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const reset = useConfirmPasswordReset()

  if (!tokenParam || !emailParam) {
    return (
      <div className='container mx-auto flex min-h-[70dvh] max-w-md items-center justify-center px-4 py-12'>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-xl'>
              <KeyRound className='size-5 text-primary' />
              Reset Kata Sandi
            </CardTitle>
            <CardDescription>
              Masukkan email terverifikasi untuk menerima kode reset kata sandi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BuyerPasswordResetForm onBack={() => router.push('/')} />
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    const parsed = ResetPasswordRequestSchema.safeParse({
      email: emailParam,
      token: tokenParam,
      password,
      password_confirmation: passwordConfirmation,
    })
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Input tidak valid')
      return
    }
    reset.mutate(parsed.data)
  }

  return (
    <div className='container mx-auto flex min-h-[70dvh] max-w-md items-center justify-center px-4 py-12'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <KeyRound className='size-5 text-primary' />
            Buat Kata Sandi Baru
          </CardTitle>
          <CardDescription>Untuk akun {emailParam}</CardDescription>
        </CardHeader>
        <CardContent>
          {reset.isSuccess ? (
            <Alert>
              <CheckCircle2 className='size-4' />
              <AlertTitle>Kata sandi diperbarui</AlertTitle>
              <AlertDescription className='space-y-3'>
                <p>Silakan masuk kembali menggunakan kata sandi baru Anda.</p>
                <Button type='button' className='w-full' onClick={() => router.push('/')}>
                  Kembali ke Beranda
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='new-password'>Kata Sandi Baru</Label>
                <Input
                  id='new-password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Minimal 8 karakter (huruf & angka)'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='confirm-password'>Ulangi Kata Sandi Baru</Label>
                <Input
                  id='confirm-password'
                  type='password'
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder='Ulangi kata sandi baru'
                />
              </div>
              {(validationError || reset.isError) && (
                <p className='text-sm text-destructive'>
                  {validationError ?? reset.error?.message}
                </p>
              )}
              <Button type='submit' className='w-full' disabled={reset.isPending}>
                {reset.isPending ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
