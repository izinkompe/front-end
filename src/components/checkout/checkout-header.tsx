'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CircleHelp, Sprout, User } from 'lucide-react'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/api/use-auth'

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
  const { data: currentUser } = useCurrentUser()
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

          <Link
            href='/'
            aria-label='PanganTani - Beranda'
            className='inline-flex min-h-11 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <Sprout className='size-4.5' aria-hidden='true' />
            </span>
            <span className='text-base font-bold text-foreground sm:text-lg'>PanganTani</span>
          </Link>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <Button variant='ghost' size='sm' nativeButton={false} render={<Link href='/bantuan' />}>
            <CircleHelp data-icon='inline-start' aria-hidden='true' />
            <span>Bantuan</span>
          </Button>

          {currentUser ? (
            <div className='flex items-center gap-2 rounded-full border border-border bg-muted/40 py-1 pr-3 pl-1'>
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
