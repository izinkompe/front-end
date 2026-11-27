import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ResetPasswordPageView } from '@/components/auth/reset-password-page-view'
import { Skeleton } from '@/components/ui/skeleton'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Reset Kata Sandi',
  description: 'Atur ulang kata sandi akun PanganTani Anda.',
})

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className='mx-auto my-12 h-80 w-full max-w-md' />}>
      <ResetPasswordPageView />
    </Suspense>
  )
}
