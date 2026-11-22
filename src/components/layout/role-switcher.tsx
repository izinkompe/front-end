'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sprout, ShieldCheck, ArrowRightLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getDashboardActor } from './dashboard-navigation-data'
import { cn } from '@/lib/utils'

interface RoleSwitcherProps {
  variant?: 'header' | 'sidebar'
  className?: string
}

export function RoleSwitcher({ variant = 'header', className }: RoleSwitcherProps) {
  const pathname = usePathname()
  const currentActor = getDashboardActor(pathname)
  const isFarmer = currentActor === 'farmer'
  const targetHref = isFarmer ? '/dashboard/admin' : '/dashboard'
  const targetLabel = isFarmer ? 'Mode Admin' : 'Mode Petani'

  if (variant === 'sidebar') {
    return (
      <div
        className={cn(
          'flex flex-col gap-2 rounded-none border border-sidebar-border bg-sidebar-accent/50 p-2.5',
          className
        )}
      >
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2 min-w-0'>
            {isFarmer ? (
              <span className='flex size-6 shrink-0 items-center justify-center bg-primary text-primary-foreground'>
                <Sprout className='size-3.5' />
              </span>
            ) : (
              <span className='flex size-6 shrink-0 items-center justify-center bg-sky-600 text-white'>
                <ShieldCheck className='size-3.5' />
              </span>
            )}
            <div className='flex flex-col min-w-0'>
              <span className='truncate text-xs font-semibold text-sidebar-foreground'>
                {isFarmer ? 'Workspace Petani' : 'Workspace Admin'}
              </span>
              <span className='truncate text-[10px] text-muted-foreground'>
                {isFarmer ? 'Kelola Hasil Panen' : 'Verifikasi & Pengawasan'}
              </span>
            </div>
          </div>
          <Badge variant={isFarmer ? 'success' : 'info'}>{isFarmer ? 'Petani' : 'Admin'}</Badge>
        </div>

        <Link href={targetHref} className='w-full'>
          <Button variant='outline' className='w-full justify-center gap-1.5'>
            <ArrowRightLeft className='size-3' />
            <span>Pindah ke {targetLabel}</span>
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-1.5 sm:gap-2', className)}>
      <Badge variant={isFarmer ? 'success' : 'info'} className='hidden sm:inline-flex gap-1 py-1'>
        {isFarmer ? <Sprout className='size-3' /> : <ShieldCheck className='size-3' />}
        <span>{isFarmer ? 'Petani Mitra' : 'Admin'}</span>
      </Badge>

      <Link href={targetHref}>
        <Button variant='outline' className='gap-1.5' aria-label={`Beralih ke ${targetLabel}`}>
          <ArrowRightLeft className='size-3.5 text-muted-foreground' />
          <span className='hidden sm:inline'>Beralih:</span>
          <span className='font-semibold'>{targetLabel}</span>
        </Button>
      </Link>
    </div>
  )
}
