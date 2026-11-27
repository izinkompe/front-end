import { Suspense } from 'react'
import type { Metadata } from 'next'
import { BuyerAuthPageView } from '@/components/auth/buyer-auth-page-view'
import { Skeleton } from '@/components/ui/skeleton'
import { buildNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = buildNoIndexMetadata({
  title: 'Masuk',
  description: 'Masuk ke akun PanganTani Anda.',
})

export default function MasukPage() {
  return (
    <Suspense fallback={<Skeleton className='mx-auto my-12 h-96 w-full max-w-md' />}>
      <BuyerAuthPageView defaultTab='login' />
    </Suspense>
  )
}
