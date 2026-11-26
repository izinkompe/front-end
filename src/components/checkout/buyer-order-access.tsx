'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import { GlobalFooter } from '@/components/layout/global-footer'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { useHydrated } from '@/hooks/use-hydrated'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { CheckoutHeader } from './checkout-header'
import { CheckoutSkeleton } from './checkout-skeleton'

export function BuyerOrderAccess({ children }: { children: ReactNode }) {
  const isHydrated = useHydrated()
  const { data: user, isPending } = useCurrentUser()
  const [open, setOpen] = useState(false)
  if (isHydrated && user?.role === 'buyer') return children
  const isWrongRole = Boolean(isHydrated && user && user.role !== 'buyer')

  return (
    <div className='flex min-h-screen flex-col'>
      <CheckoutHeader backHref='/pasar' backLabel='Pasar Panen' />
      <div className='flex-1'>
        {!isHydrated || isPending ? (
          <CheckoutSkeleton />
        ) : (
          <main className='mx-auto w-full max-w-4xl px-4 py-10 sm:px-6'>
            <Empty>
              <EmptyHeader>
                <EmptyTitle>
                  {isWrongRole
                    ? 'Gunakan akun pembeli untuk membuka pesanan'
                    : 'Masuk untuk membuka pesanan'}
                </EmptyTitle>
                <EmptyDescription>
                  {isWrongRole
                    ? 'Halaman detail dan pembayaran pesanan hanya tersedia untuk akun pembeli.'
                    : 'Masuk atau daftar akun pembeli untuk memantau pembayaran dan pengambilan panen.'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className='flex-row flex-wrap justify-center'>
                <Button onClick={() => setOpen(true)}>
                  {isWrongRole ? 'Ganti ke akun pembeli' : 'Masuk sebagai pembeli'}
                </Button>
                <Button variant='outline' nativeButton={false} render={<Link href='/akun' />}>
                  Pesanan Saya
                </Button>
              </EmptyContent>
            </Empty>
            <BuyerAuthDialog open={open} onOpenChange={setOpen} />
          </main>
        )}
      </div>
      <GlobalFooter />
    </div>
  )
}
