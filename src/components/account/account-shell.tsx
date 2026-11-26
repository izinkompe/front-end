'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MapPin,
  Pencil,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  User as UserIcon,
  UserRound,
} from 'lucide-react'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/api/use-auth'
import {
  calculateProfileCompletion,
  formatUserRoleLabel,
  getUserInitials,
  isSafeAvatarUrl,
} from '@/lib/data/profile-helpers'
import { cn } from '@/lib/utils'

interface AccountNavItem {
  href: string
  label: string
  icon: typeof ShoppingBag
}

const accountNavItems: ReadonlyArray<AccountNavItem> = [
  { href: '/akun', label: 'Pesanan Saya', icon: ShoppingBag },
  { href: '/akun/profil', label: 'Data Profil', icon: UserIcon },
  { href: '/akun/alamat', label: 'Alamat Tersimpan', icon: MapPin },
  { href: '/akun/transaksi', label: 'Riwayat Transaksi', icon: ReceiptText },
  { href: '/akun/verifikasi', label: 'Kontak & Verifikasi', icon: ShieldCheck },
  { href: '/akun/pengaturan', label: 'Pengaturan', icon: Settings },
]

function getBreadcrumbLabel(pathname: string): string {
  const matched = accountNavItems.find((item) => item.href === pathname)
  return matched?.label ?? 'Akun'
}

function AccountShellSkeleton() {
  return (
    <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8'>
      <Skeleton className='h-5 w-40' />
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]'>
        <div className='flex flex-col gap-4'>
          <Skeleton className='h-40 w-full rounded-xl' />
          <Skeleton className='h-72 w-full rounded-xl' />
        </div>
        <Skeleton className='h-96 w-full rounded-xl' />
      </div>
    </div>
  )
}

export function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { data: currentUser, isPending } = useCurrentUser()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  if (isPending) {
    return <AccountShellSkeleton />
  }

  const activeLabel = getBreadcrumbLabel(pathname)

  if (!currentUser) {
    return (
      <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href='/' />}>Beranda</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Akun</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card>
          <CardContent className='py-10'>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <UserRound aria-hidden='true' />
                </EmptyMedia>
                <EmptyTitle className='text-base font-semibold'>
                  Masuk ke akun PanganTani
                </EmptyTitle>
                <EmptyDescription>
                  Kelola pesanan panen, alamat pengambilan, riwayat transaksi, dan data profil Anda.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className='flex-row flex-wrap justify-center gap-2'>
                <Button type='button' onClick={() => setAuthDialogOpen(true)}>
                  Masuk sebagai pembeli
                </Button>
                <Button
                  variant='outline'
                  nativeButton={false}
                  render={<Link href='/masuk-petani' />}
                >
                  Masuk sebagai petani
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>

        <BuyerAuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </div>
    )
  }

  const completion = calculateProfileCompletion(currentUser)
  const avatarSrc = isSafeAvatarUrl(currentUser.avatarUrl)
  const needsVerificationAttention = !currentUser.phone || !currentUser.isPhoneVerified
  const canAccessDashboard = currentUser.role === 'farmer' || currentUser.role === 'admin'

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href='/' />}>Beranda</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href='/akun' />}>Akun</BreadcrumbLink>
          </BreadcrumbItem>
          {pathname !== '/akun' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{activeLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start'>
        <aside className='flex flex-col gap-4 lg:sticky lg:top-32'>
          <Card>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex items-center gap-3'>
                <Avatar className='size-14 shrink-0'>
                  {avatarSrc && <AvatarImage src={avatarSrc} alt={currentUser.name} />}
                  <AvatarFallback>{getUserInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                  <p className='truncate text-base font-semibold text-foreground'>
                    {currentUser.name}
                  </p>
                  <p className='truncate text-sm text-muted-foreground'>
                    {currentUser.organization?.trim() || formatUserRoleLabel(currentUser.role)}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  nativeButton={false}
                  render={<Link href='/akun/profil' aria-label='Ubah data profil' />}
                >
                  <Pencil aria-hidden='true' />
                </Button>
              </div>

              {completion.percentage < 100 && (
                <>
                  <Separator />
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-between gap-2 text-sm tabular-nums'>
                      <span className='font-semibold text-primary'>{completion.percentage}%</span>
                      <span className='text-muted-foreground'>
                        {completion.completedCount} / {completion.totalCount} data terisi
                      </span>
                    </div>
                    <Progress value={completion.percentage} aria-label='Kelengkapan data profil' />
                    {completion.nextStepText && (
                      <p className='text-xs text-muted-foreground'>{completion.nextStepText}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <nav aria-label='Menu akun mobile' className='flex gap-2 overflow-x-auto pb-1 lg:hidden'>
            {accountNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const showAlertDot = item.href === '/akun/verifikasi' && needsVerificationAttention
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring',
                    isActive
                      ? 'border-primary/40 bg-primary/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className='size-4 shrink-0' aria-hidden='true' />
                  <span>{item.label}</span>
                  {showAlertDot && (
                    <span
                      className='size-2 shrink-0 rounded-full bg-destructive'
                      aria-label='Perlu verifikasi'
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          <Card className='hidden lg:flex'>
            <CardContent className='px-2 py-0'>
              <nav aria-label='Menu akun' className='flex flex-col gap-1'>
                {accountNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const showAlertDot =
                    item.href === '/akun/verifikasi' && needsVerificationAttention
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive
                          ? 'bg-accent font-semibold text-foreground'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                      )}
                    >
                      <span className='flex min-w-0 items-center gap-3'>
                        <Icon
                          className={cn(
                            'size-4 shrink-0',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          )}
                          aria-hidden='true'
                        />
                        <span className='truncate'>{item.label}</span>
                      </span>
                      {showAlertDot && (
                        <span
                          className='size-2 shrink-0 rounded-full bg-destructive'
                          aria-label='Perlu verifikasi'
                        />
                      )}
                    </Link>
                  )
                })}

                {canAccessDashboard && (
                  <>
                    <Separator className='my-1' />
                    <Link
                      href='/dashboard'
                      className='flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    >
                      <LayoutDashboard className='size-4 shrink-0' aria-hidden='true' />
                      <span>Dashboard Mitra</span>
                    </Link>
                  </>
                )}
              </nav>
            </CardContent>
          </Card>
        </aside>

        <section className='min-w-0'>{children}</section>
      </div>
    </div>
  )
}
