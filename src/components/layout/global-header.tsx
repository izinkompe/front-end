'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sprout, Menu, X, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', label: 'Beranda' },
  { href: '/pasar', label: 'Pasar Pangan' },
  { href: '/edukasi', label: 'Edukasi Tani' },
  { href: '/tentang', label: 'Tentang Kami' },
]

export function GlobalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className='sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-6'>
          <Link
            href='/'
            className='flex items-center gap-2 font-bold text-lg text-foreground hover:opacity-90 transition-opacity'
          >
            <span className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <Sprout className='size-5' />
            </span>
            <span>PanganTani</span>
          </Link>

          <nav
            aria-label='Navigasi Utama'
            className='hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground'
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-md px-3 py-2 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className='hidden md:flex items-center gap-3'>
          <Link href='/dashboard'>
            <Button variant='outline' size='sm' className='gap-1.5'>
              <LayoutDashboard className='size-4' />
              <span>Akses Dashboard</span>
            </Button>
          </Link>
        </div>

        <div className='flex md:hidden items-center gap-2'>
          <button
            type='button'
            className='inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            aria-controls='mobile-menu'
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className='size-5' /> : <Menu className='size-5' />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id='mobile-menu'
          className='md:hidden border-t border-border bg-background px-4 pt-3 pb-4 space-y-2'
        >
          <nav aria-label='Navigasi Mobile' className='flex flex-col space-y-1'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className='pt-3 border-t border-border'>
            <Link href='/dashboard' onClick={() => setMobileMenuOpen(false)}>
              <Button variant='default' className='w-full gap-2'>
                <LayoutDashboard className='size-4' />
                <span>Akses Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
