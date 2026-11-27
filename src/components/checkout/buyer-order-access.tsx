'use client'

import { useState, type ReactNode } from 'react'
import { AccountLink } from '@/components/auth/account-link'
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
  const { data: user, isPending, isError, error, refetch } = useCurrentUser()
  const [open, setOpen] = useState(false)
  if (isHydrated && !isError && user?.role === 'buyer') return children
  const isWrongRole = Boolean(isHydrated && !isError && user && user.role !== 'buyer')
  const errorMessage =
    isError && error instanceof Error && error.message
      ? error.message
      : 'Terjadi kesalahan saat memverifikasi sesi akun Anda.'

  return (
    <div className='flex min-h-screen flex-col'>
      <CheckoutHeader backHref='/pasar' backLabel='Pasar Panen' />
      <div className='flex-1'>
        {!isHydrated || isPending ? (
          <CheckoutSkeleton />
        ) : isError ? (
          <main className='mx-auto w-full max-w-4xl px-4 py-10 sm:px-6'>
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Gagal memverifikasi sesi akun</EmptyTitle>
                <EmptyDescription>{errorMessage}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent className='flex-row flex-wrap justify-center'>
                <Button
                  type='button'
                  onClick={() => {
                    void refetch()
                  }}
                >
                  Coba lagi
                </Button>
                <Button type='button' variant='outline' onClick={() => setOpen(true)}>
                  Masuk ulang
                </Button>
              </EmptyContent>
            </Empty>
            <BuyerAuthDialog open={open} onOpenChange={setOpen} />
          </main>
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
                <Button
                  variant='outline'
                  nativeButton={false}
                  render={<AccountLink href='/akun' />}
                >
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
