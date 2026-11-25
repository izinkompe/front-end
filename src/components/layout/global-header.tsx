'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Heart, Menu, ShoppingBag, Sprout, User, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import { LocationPicker } from '@/components/layout/location-picker'
import { useSelectedLocation } from '@/components/providers/location-provider'
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
  const [isScrolled, setIsScrolled] = useState(false)
  const { selectedLocation, setSelectedLocation } = useSelectedLocation()
  const pathname = usePathname()
  const { data: currentUser } = useCurrentUser()

  const isHeroPage = pathname === '/'
  const isTransparent = isHeroPage && !isScrolled && !mobileMenuOpen

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const transparentIconClass =
    'text-white hover:bg-white/15 hover:text-white focus-visible:ring-white/60'

  return (
    <header
      className={cn(
        'z-40 w-full transition-colors duration-200',
        isHeroPage ? 'fixed inset-x-0 top-0' : 'sticky top-0',
        isTransparent ? 'bg-transparent text-white' : 'bg-background text-foreground shadow-xs'
      )}
    >
      <div
        className={cn(
          'hidden transition-colors duration-200 lg:block',
          isTransparent ? 'bg-transparent text-white' : 'bg-secondary text-secondary-foreground'
        )}
      >
        <div className='mx-auto flex min-h-11 max-w-7xl items-center justify-end gap-3 px-4 py-1 sm:px-6 lg:px-8'>
          <LocationPicker
            selected={selectedLocation}
            onSelect={setSelectedLocation}
            variant={isTransparent ? 'overlay' : 'banner'}
          />
          <span
            className={cn('h-4 w-px', isTransparent ? 'bg-white/25' : 'bg-border')}
            aria-hidden='true'
          />
          <Link
            href='/daftar-petani'
            className={cn(
              'inline-flex min-h-9 items-center rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2',
              isTransparent
                ? 'text-white/95 hover:text-white focus-visible:ring-white/60'
                : 'text-secondary-foreground/90 hover:text-secondary-foreground focus-visible:ring-ring'
            )}
          >
            Daftar Jadi Petani
          </Link>
        </div>
      </div>

      <Collapsible open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div
          className={cn(
            'border-b transition-colors duration-200',
            isTransparent ? 'border-transparent' : 'border-border'
          )}
        >
          <div className='mx-auto grid min-h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2 sm:gap-4 sm:px-6 lg:px-8'>
            <div className='flex min-w-0 items-center'>
              <div className='flex min-w-0 items-center gap-1.5 lg:hidden'>
                <CollapsibleTrigger
                  render={
                    <Button
                      variant='ghost'
                      size='icon'
                      className={cn(isTransparent && transparentIconClass)}
                      aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
                    />
                  }
                >
                  {mobileMenuOpen ? <X /> : <Menu />}
                </CollapsibleTrigger>
                <LocationPicker
                  selected={selectedLocation}
                  onSelect={setSelectedLocation}
                  variant={isTransparent ? 'overlay-pill' : 'secondary'}
                />
              </div>

              <nav
                aria-label='Kategori Komoditas'
                className='hidden flex-wrap items-center gap-1 xl:gap-2 lg:flex'
              >
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'inline-flex min-h-11 items-center rounded-md px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2',
                        isTransparent
                          ? 'text-white/95 hover:bg-white/15 hover:text-white focus-visible:ring-white/60'
                          : isActive
                            ? 'text-foreground focus-visible:ring-ring'
                            : 'text-muted-foreground hover:text-foreground focus-visible:ring-ring'
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
              className={cn(
                'inline-flex min-h-11 min-w-11 items-center justify-center justify-self-center rounded-lg transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2',
                isTransparent ? 'focus-visible:ring-white/60' : 'focus-visible:ring-ring'
              )}
            >
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-lg transition-colors duration-200',
                  isTransparent
                    ? 'bg-white text-primary shadow-sm'
                    : 'bg-primary text-primary-foreground'
                )}
              >
                <Sprout className='size-5' aria-hidden='true' />
              </span>
              <span className='sr-only'>PanganTani</span>
            </Link>

            <div className='flex items-center justify-end gap-1 sm:gap-1.5'>
              <Button
                variant='ghost'
                size='icon'
                className={cn(isTransparent && transparentIconClass)}
                nativeButton={false}
                render={<Link href='/favorit' aria-label='Favorit' />}
              >
                <Heart />
              </Button>

              <Button
                variant='ghost'
                size='icon'
                className={cn(isTransparent && transparentIconClass)}
                nativeButton={false}
                render={<Link href='/keranjang' aria-label='Keranjang' />}
              >
                <ShoppingBag />
              </Button>

              {currentUser ? (
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn('rounded-full', isTransparent && transparentIconClass)}
                  nativeButton={false}
                  render={<Link href='/dashboard' aria-label={`Akun ${currentUser.name}`} />}
                >
                  <Avatar>
                    {currentUser.avatarUrl && (
                      <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    )}
                    <AvatarFallback>{getUserInitials(currentUser.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              ) : (
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn(isTransparent && transparentIconClass)}
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
                      'flex min-h-12 items-center justify-between rounded-md px-3.5 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'text-foreground/85 hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className='size-4.5 text-muted-foreground' aria-hidden='true' />
                  </Link>
                )
              })}
              <Link
                href='/daftar-petani'
                onClick={() => setMobileMenuOpen(false)}
                className='mt-1 flex min-h-12 items-center justify-between rounded-md border-t border-border px-3.5 py-3 text-base font-medium text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              >
                <span>Daftar Jadi Petani</span>
                <ChevronRight className='size-4.5 text-primary' aria-hidden='true' />
              </Link>
            </nav>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <BuyerAuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </header>
  )
}
