'use client'

import { Menu, Bell } from 'lucide-react'

interface DashboardHeaderProps {
  onOpenMobileSidebar: () => void
}

export function DashboardHeader({ onOpenMobileSidebar }: DashboardHeaderProps) {
  return (
    <header className='sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 py-2 md:px-6 backdrop-blur supports-backdrop-filter:bg-background/80'>
      <div className='flex items-center gap-3'>
        <button
          type='button'
          onClick={onOpenMobileSidebar}
          className='inline-flex min-h-11 min-w-11 md:hidden items-center justify-center rounded-lg p-2 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          aria-label='Buka sidebar navigasi'
        >
          <Menu className='size-5' aria-hidden='true' />
        </button>
        <span className='text-base font-semibold text-foreground'>Area Pengelola</span>
      </div>

      <div className='flex items-center gap-2'>
        <button
          type='button'
          className='relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          aria-label='Notifikasi'
        >
          <Bell className='size-5' aria-hidden='true' />
        </button>
      </div>
    </header>
  )
}
