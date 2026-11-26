'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Heart, LayoutGrid, Menu, Sprout, X } from 'lucide-react'
import { HeaderNotificationsPopover } from './header-notifications-popover'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import { useFavoritesSidebar } from '@/components/favorites/favorites-sidebar-provider'
import { HeroSearchCombobox } from '@/components/home/hero-search-combobox'
import {
  buildBuyerSearchHref,
  type BuyerCategoryFilter,
} from '@/components/home/hero-search-params'
import type {
  CommoditySuggestion,
  OfferSuggestion,
} from '@/components/home/hero-search-suggestions'
import {
  categoryNavItems,
  DesktopMenuLink,
  MobileNavLink,
  moreNavItems,
  primaryNavLinks,
} from '@/components/layout/header-nav-links'
import { HeaderUserMenu } from '@/components/layout/header-user-menu'
import { LocationPicker } from '@/components/layout/location-picker'
import { useSelectedLocation } from '@/components/providers/location-provider'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useOffers } from '@/hooks/api/use-offers'
import { cn } from '@/lib/utils'

export function GlobalHeader({
  containerClassName = 'max-w-none',
}: {
  containerClassName?: string
}) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authDialogTab, setAuthDialogTab] = useState<'login' | 'register'>('login')
  const [isScrolled, setIsScrolled] = useState(false)

  function openAuthDialog(tab: 'login' | 'register') {
    setAuthDialogTab(tab)
    setAuthDialogOpen(true)
  }
  const [searchQuery, setSearchQuery] = useState('')
  const { selectedLocation, setSelectedLocation } = useSelectedLocation()
  const { open: favoritesOpen, openFavorites } = useFavoritesSidebar()
  const pathname = usePathname()
  const { data: currentUser } = useCurrentUser()
  const { data: offers = [] } = useOffers()

  const isHeroPage = pathname === '/'
  const isTransparent = isHeroPage && !isScrolled && !mobileMenuOpen
  const isCategoryActive = categoryNavItems.some((item) => pathname === item.href)
  const isMoreActive = moreNavItems.some((item) => pathname === item.href)

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function navigateSearch(nextQuery: string, nextCategory: BuyerCategoryFilter = 'semua') {
    const href = buildBuyerSearchHref({
      mode: 'katalog',
      query: nextQuery,
      category: nextCategory,
      radiusKm: '10',
      minStockKg: 'semua',
      deadlineWindow: 'semua',
      pickupDate: null,
      location: selectedLocation,
    })
    router.push(href)
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigateSearch(searchQuery)
  }

  function handleSelectCommodity(commodity: CommoditySuggestion) {
    setSearchQuery(commodity.label)
    navigateSearch(commodity.label, commodity.categorySlug)
  }

  function handleSelectOffer(offer: OfferSuggestion) {
    router.push(offer.href)
  }

  const transparentIconClass =
    'text-white hover:bg-white/15 hover:text-white focus-visible:ring-white/60'
  const containerClass = cn('mx-auto px-4 sm:px-6 lg:px-8', containerClassName)

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 w-full transition-colors duration-200',
          isTransparent ? 'bg-transparent text-white' : 'bg-background text-foreground shadow-xs'
        )}
      >
        <div
          className={cn(
            'transition-colors duration-200',
            isTransparent ? 'bg-transparent text-white' : 'bg-secondary text-secondary-foreground'
          )}
        >
          <div
            className={cn(
              containerClass,
              'flex min-h-10 items-center justify-between gap-2 py-1 lg:min-h-11 lg:gap-4'
            )}
          >
            <div className='min-w-0'>
              <LocationPicker
                selected={selectedLocation}
                onSelect={setSelectedLocation}
                variant={isTransparent ? 'overlay' : 'banner'}
              />
            </div>

            <Link
              href='/daftar-petani'
              className={cn(
                'inline-flex min-h-9 shrink-0 items-center rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 sm:px-2.5 sm:py-1.5 sm:text-sm',
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
            <div
              className={cn(
                containerClass,
                'flex min-h-16 items-center justify-between gap-3 py-2.5 sm:gap-4 lg:gap-5'
              )}
            >
              <div className='flex min-w-0 flex-1 items-center gap-2 lg:gap-5'>
                <div className='flex items-center lg:hidden'>
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
                </div>

                <Link
                  href='/'
                  aria-label='PanganTani - Beranda'
                  className={cn(
                    'inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2',
                    isTransparent ? 'focus-visible:ring-white/60' : 'focus-visible:ring-ring'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
                      isTransparent
                        ? 'bg-white text-primary shadow-sm'
                        : 'bg-primary text-primary-foreground'
                    )}
                  >
                    <Sprout className='size-5' aria-hidden='true' />
                  </span>
                  <span
                    className={cn(
                      'hidden text-lg font-bold tracking-tight sm:inline',
                      isTransparent ? 'text-white' : 'text-foreground'
                    )}
                  >
                    PanganTani
                  </span>
                </Link>

                <form
                  onSubmit={handleSearchSubmit}
                  role='search'
                  aria-label='Pencarian panen surplus'
                  className='hidden min-w-0 flex-1 max-w-sm xl:max-w-md lg:block'
                >
                  <HeroSearchCombobox
                    query={searchQuery}
                    onQueryChange={setSearchQuery}
                    offers={offers}
                    onSubmitQuery={(nextQuery) => navigateSearch(nextQuery)}
                    onSelectCommodity={handleSelectCommodity}
                    onSelectOffer={handleSelectOffer}
                    className='w-full text-foreground'
                    pill
                  />
                </form>

                <nav
                  aria-label='Navigasi Utama'
                  className='hidden shrink-0 items-center gap-1 xl:gap-2 lg:flex'
                >
                  <Popover open={categoryMenuOpen} onOpenChange={setCategoryMenuOpen}>
                    <PopoverTrigger
                      render={
                        <button
                          type='button'
                          className={cn(
                            'inline-flex min-h-9 items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2',
                            isTransparent
                              ? 'text-white/95 hover:text-white aria-expanded:text-white focus-visible:ring-white/60'
                              : isCategoryActive
                                ? 'text-foreground focus-visible:ring-ring'
                                : 'text-foreground/85 hover:text-foreground aria-expanded:text-foreground focus-visible:ring-ring'
                          )}
                        />
                      }
                    >
                      <span>Kategori</span>
                      <ChevronDown
                        className={cn(
                          'size-4 shrink-0 transition-transform duration-150',
                          categoryMenuOpen && 'rotate-180'
                        )}
                        aria-hidden='true'
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      align='start'
                      sideOffset={8}
                      positionMethod='fixed'
                      className='w-64 gap-0.5 p-1.5'
                    >
                      {categoryNavItems.map((item) => (
                        <DesktopMenuLink
                          key={item.href}
                          item={item}
                          isActive={pathname === item.href}
                          onSelect={() => setCategoryMenuOpen(false)}
                        />
                      ))}
                      <Separator className='my-1' />
                      <DesktopMenuLink
                        item={{ href: '/pasar', label: 'Semua Panen', icon: LayoutGrid }}
                        isActive={pathname === '/pasar'}
                        onSelect={() => setCategoryMenuOpen(false)}
                      />
                    </PopoverContent>
                  </Popover>

                  {primaryNavLinks.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'inline-flex min-h-9 items-center rounded-md px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2',
                          isTransparent
                            ? 'text-white/95 hover:text-white focus-visible:ring-white/60'
                            : isActive
                              ? 'text-foreground focus-visible:ring-ring'
                              : 'text-foreground/85 hover:text-foreground focus-visible:ring-ring'
                        )}
                      >
                        {item.label}
                      </Link>
                    )
                  })}

                  <Popover open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
                    <PopoverTrigger
                      render={
                        <button
                          type='button'
                          className={cn(
                            'inline-flex min-h-9 items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2',
                            isTransparent
                              ? 'text-white/95 hover:text-white aria-expanded:text-white focus-visible:ring-white/60'
                              : isMoreActive
                                ? 'text-foreground focus-visible:ring-ring'
                                : 'text-foreground/85 hover:text-foreground aria-expanded:text-foreground focus-visible:ring-ring'
                          )}
                        />
                      }
                    >
                      <span>Lainnya</span>
                      <ChevronDown
                        className={cn(
                          'size-4 shrink-0 transition-transform duration-150',
                          moreMenuOpen && 'rotate-180'
                        )}
                        aria-hidden='true'
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      align='start'
                      sideOffset={8}
                      positionMethod='fixed'
                      className='w-60 gap-0.5 p-1.5'
                    >
                      {moreNavItems.map((item) => (
                        <DesktopMenuLink
                          key={item.href}
                          item={item}
                          isActive={pathname === item.href}
                          onSelect={() => setMoreMenuOpen(false)}
                        />
                      ))}
                    </PopoverContent>
                  </Popover>
                </nav>
              </div>

              <div className='flex shrink-0 items-center justify-end gap-1.5 sm:gap-2'>
                {currentUser ? (
                  <>
                    <Button
                      variant='ghost'
                      size='icon'
                      className={cn(isTransparent && transparentIconClass)}
                      aria-label='Favorit'
                      aria-expanded={favoritesOpen}
                      onClick={openFavorites}
                    >
                      <Heart />
                    </Button>

                    <HeaderNotificationsPopover
                      signedIn={Boolean(currentUser)}
                      className={cn('relative', isTransparent && transparentIconClass)}
                      onSignIn={() => openAuthDialog('login')}
                    />

                    <HeaderUserMenu
                      user={currentUser}
                      pathname={pathname}
                      isTransparent={isTransparent}
                      transparentIconClass={transparentIconClass}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      variant='secondary'
                      size='sm'
                      className={cn(
                        isTransparent &&
                          'bg-white/15 text-white hover:bg-white/25 hover:text-white focus-visible:ring-white/60'
                      )}
                      onClick={() => openAuthDialog('login')}
                    >
                      Masuk
                    </Button>
                    <Button
                      variant='default'
                      size='sm'
                      className={cn(isTransparent && 'bg-white text-foreground hover:bg-white/90')}
                      onClick={() => openAuthDialog('register')}
                    >
                      Daftar
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className={cn(containerClass, 'pb-3 lg:hidden')}>
              <form
                onSubmit={handleSearchSubmit}
                role='search'
                aria-label='Pencarian panen surplus mobile'
              >
                <HeroSearchCombobox
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                  offers={offers}
                  onSubmitQuery={(nextQuery) => navigateSearch(nextQuery)}
                  onSelectCommodity={handleSelectCommodity}
                  onSelectOffer={handleSelectOffer}
                  className='w-full text-foreground'
                />
              </form>
            </div>
          </div>

          <CollapsibleContent className='max-h-[calc(100dvh-10.3125rem)] overflow-y-auto border-b border-border bg-background transition-all duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 lg:hidden'>
            <div className={cn('mx-auto px-4 py-3 sm:px-6', containerClassName)}>
              <nav aria-label='Navigasi Mobile' className='flex flex-col gap-1'>
                <p className='px-3.5 pt-1 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Kategori
                </p>
                {categoryNavItems.map((item) => (
                  <MobileNavLink
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    onSelect={() => setMobileMenuOpen(false)}
                  />
                ))}
                <MobileNavLink
                  item={{ href: '/pasar', label: 'Semua Panen', icon: LayoutGrid }}
                  isActive={pathname === '/pasar'}
                  onSelect={() => setMobileMenuOpen(false)}
                />

                <Separator className='my-1.5' />
                <p className='px-3.5 pt-1 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Jelajah
                </p>
                {primaryNavLinks.map((item) => (
                  <MobileNavLink
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    onSelect={() => setMobileMenuOpen(false)}
                  />
                ))}

                <Separator className='my-1.5' />
                <p className='px-3.5 pt-1 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Lainnya
                </p>
                {moreNavItems.map((item) => (
                  <MobileNavLink
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    onSelect={() => setMobileMenuOpen(false)}
                  />
                ))}

                <Link
                  href='/daftar-petani'
                  onClick={() => setMobileMenuOpen(false)}
                  className='mt-1 flex min-h-12 items-center justify-between rounded-md border-t border-border px-3.5 py-3 text-base font-medium text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sidebar-primary'
                >
                  <span>Daftar Jadi Petani</span>
                  <ChevronRight
                    className='size-4.5 text-primary dark:text-sidebar-primary'
                    aria-hidden='true'
                  />
                </Link>
              </nav>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <BuyerAuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          defaultTab={authDialogTab}
        />
      </header>
      {!isHeroPage && (
        <div aria-hidden='true' className='h-[10.3125rem] shrink-0 lg:h-[6.875rem]' />
      )}
    </>
  )
}
