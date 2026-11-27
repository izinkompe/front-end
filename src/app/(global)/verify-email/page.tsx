import { Suspense } from 'react'
import type { Metadata } from 'next'
import { VerifyEmailView } from '@/components/auth/verify-email-view'
import { Skeleton } from '@/components/ui/skeleton'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Verifikasi Email',
  description: 'Verifikasi alamat email akun PanganTani Anda.',
})

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Skeleton className='mx-auto my-12 h-80 w-full max-w-md' />}>
      <VerifyEmailView />
    </Suspense>
  )
}
