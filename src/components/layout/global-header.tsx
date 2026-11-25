'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Heart, Menu, ShoppingBag, Sprout, User, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import {
  LocationPicker,
  defaultLocation,
  type SelectedLocation,
} from '@/components/layout/location-picker'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/pasar/sayuran', label: 'Sayuran' },
  { href: '/pasar/buah', label: 'Buah' },
  { href: '/pasar/padi-biji', label: 'Padi & Biji-bijian' },
  { href: '/pasar/rempah-umbi', label: 'Rempah & Umbi' },
]

function getUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'PT'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function GlobalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>(defaultLocation)
  const pathname = usePathname()
  const { data: currentUser } = useCurrentUser()

  return (
    <header className='sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85'>
      <div className='hidden border-b border-border bg-secondary text-secondary-foreground lg:block'>
        <div className='mx-auto flex min-h-9 max-w-7xl items-center justify-end gap-3 px-4 py-1.5 sm:px-6 lg:px-8'>
          <LocationPicker
            selected={selectedLocation}
            onSelect={setSelectedLocation}
            variant='banner'
          />
          <span className='h-3.5 w-px bg-border' aria-hidden='true' />
          <Link
            href='/daftar-petani'
            className='rounded-sm text-xs font-medium text-secondary-foreground/85 transition-colors hover:text-secondary-foreground hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            Daftar Jadi Petani
          </Link>
        </div>
      </div>

      <Collapsible open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div className='border-b border-border'>
          <div className='mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8'>
            <div className='flex min-w-0 items-center'>
              <div className='flex min-w-0 items-center gap-1.5 lg:hidden'>
                <CollapsibleTrigger
                  render={
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
                    />
                  }
                >
                  {mobileMenuOpen ? <X /> : <Menu />}
                </CollapsibleTrigger>
                <LocationPicker
                  selected={selectedLocation}
                  onSelect={setSelectedLocation}
                  variant='secondary'
                />
              </div>

              <nav aria-label='Kategori Komoditas' className='hidden items-center gap-6 lg:flex'>
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'rounded-sm text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <Link
              href='/'
              aria-label='PanganTani - Beranda'
              className='inline-flex items-center justify-center justify-self-center rounded-lg transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            >
              <span className='flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                <Sprout className='size-5' aria-hidden='true' />
              </span>
              <span className='sr-only'>PanganTani</span>
            </Link>

            <div className='flex items-center justify-end gap-1 sm:gap-2'>
              <Button
                variant='ghost'
                size='icon-sm'
                className='md:size-8'
                nativeButton={false}
                render={<Link href='/favorit' aria-label='Favorit' />}
              >
                <Heart />
              </Button>

              <Button
                variant='ghost'
                size='icon-sm'
                className='md:size-8'
                nativeButton={false}
                render={<Link href='/keranjang' aria-label='Keranjang' />}
              >
                <ShoppingBag />
              </Button>

              {currentUser ? (
                <Button
                  variant='ghost'
                  size='icon-sm'
                  className='rounded-full md:size-8'
                  nativeButton={false}
                  render={<Link href='/dashboard' aria-label={`Akun ${currentUser.name}`} />}
                >
                  <Avatar size='sm' className='md:size-7'>
                    {currentUser.avatarUrl && (
                      <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    )}
                    <AvatarFallback>{getUserInitials(currentUser.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              ) : (
                <Button
                  variant='ghost'
                  size='icon-sm'
                  className='md:size-8'
                  aria-label='Masuk atau daftar akun pembeli'
                  onClick={() => setAuthDialogOpen(true)}
                >
                  <User />
                </Button>
              )}
            </div>
          </div>
        </div>

        <CollapsibleContent className='overflow-hidden border-b border-border bg-background transition-all duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 lg:hidden'>
          <div className='mx-auto max-w-7xl px-4 py-3 sm:px-6'>
            <nav aria-label='Kategori Komoditas Mobile' className='flex flex-col gap-1'>
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'text-foreground/85 hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className='size-4 text-muted-foreground' aria-hidden='true' />
                  </Link>
                )
              })}
            </nav>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <BuyerAuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </header>
  )
}
