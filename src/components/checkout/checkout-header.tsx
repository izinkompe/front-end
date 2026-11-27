'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CircleHelp, User } from 'lucide-react'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import { BrandLogo } from '@/components/shared/brand-logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useHydrated } from '@/hooks/use-hydrated'

interface CheckoutHeaderProps {
  backHref: string
  backLabel: string
}

function getUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'PT'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function CheckoutHeader({ backHref, backLabel }: CheckoutHeaderProps) {
  const isHydrated = useHydrated()
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <header className='sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xs'>
      <div className='mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8'>
        <div className='flex min-w-0 items-center gap-3'>
          <Button
            variant='ghost'
            size='sm'
            nativeButton={false}
            render={<Link href={backHref} />}
            className='shrink-0'
          >
            <ArrowLeft data-icon='inline-start' aria-hidden='true' />
            <span className='hidden sm:inline'>{backLabel}</span>
            <span className='sm:hidden'>Kembali</span>
          </Button>

          <span className='h-5 w-px bg-border' aria-hidden='true' />

          <BrandLogo size='sm' wordmarkClassName='hidden sm:inline' />
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <Button variant='ghost' size='sm' nativeButton={false} render={<Link href='/bantuan' />}>
            <CircleHelp data-icon='inline-start' aria-hidden='true' />
            <span>Bantuan</span>
          </Button>

          {!isHydrated || (isAuthPending && !currentUser) ? (
            <Skeleton className='h-9 w-24 rounded-full' aria-hidden='true' />
          ) : currentUser ? (
            <div className='flex items-center gap-2 rounded-full border border-border bg-muted/40 p-1 sm:pr-3'>
              <Avatar className='size-7'>
                {currentUser.avatarUrl && (
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                )}
                <AvatarFallback className='text-xs'>
                  {getUserInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <span className='hidden max-w-36 truncate text-sm font-medium text-foreground sm:inline'>
                {currentUser.name}
              </span>
            </div>
          ) : (
            <Button type='button' variant='outline' size='sm' onClick={() => setAuthOpen(true)}>
              <User data-icon='inline-start' aria-hidden='true' />
              <span>Masuk</span>
            </Button>
          )}
        </div>
      </div>

      <BuyerAuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  )
}
