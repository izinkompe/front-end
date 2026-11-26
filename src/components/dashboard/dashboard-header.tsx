'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Settings, Store, User as UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { getDashboardPageTitle } from '@/components/dashboard/dashboard-nav-config'
import { HeaderNotificationsPopover } from '@/components/layout/header-notifications-popover'
import { useLogout } from '@/hooks/api/use-auth'
import { getRoleLabel, isAuthRelaxed } from '@/lib/auth/rbac'
import { getUserInitials, isSafeAvatarUrl } from '@/lib/data/profile-helpers'
import type { UserRole } from '@/types/api/auth'

interface DashboardHeaderProps {
  role: UserRole
  userName: string
  userEmail: string
  avatarUrl?: string
  isAuthenticatedSession: boolean
}

export function DashboardHeader({
  role,
  userName,
  userEmail,
  avatarUrl,
  isAuthenticatedSession,
}: DashboardHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const logoutMutation = useLogout()
  const pageTitle = getDashboardPageTitle(pathname, role)
  const roleLabel = getRoleLabel(role)
  const avatarSrc = isSafeAvatarUrl(avatarUrl)

  return (
    <header className='sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-sm'>
      <div className='flex min-w-0 items-center gap-2'>
        <SidebarTrigger aria-label='Buka atau tutup menu samping' />
        <Separator orientation='vertical' className='h-5' />
        <Breadcrumb className='min-w-0'>
          <BreadcrumbList>
            <BreadcrumbItem className='hidden sm:inline-flex'>
              <BreadcrumbLink render={<Link href='/dashboard' />}>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className='hidden sm:inline-flex' />
            <BreadcrumbItem>
              <BreadcrumbPage className='truncate'>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className='flex shrink-0 items-center gap-2'>
        <Badge variant='outline' className='hidden sm:inline-flex'>
          {roleLabel}
        </Badge>
        {isAuthRelaxed() && (
          <Badge variant='secondary' className='hidden md:inline-flex'>
            Auth Longgar
          </Badge>
        )}

        <HeaderNotificationsPopover
          signedIn={isAuthenticatedSession}
          onSignIn={() => router.push('/masuk-petani')}
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant='ghost'
                size='icon'
                className='size-10 rounded-full p-0'
                aria-label={`Menu akun ${userName}`}
              />
            }
          >
            <Avatar size='lg'>
              {avatarSrc && <AvatarImage src={avatarSrc} alt={userName} />}
              <AvatarFallback>{getUserInitials(userName)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' sideOffset={8} className='w-60'>
            <DropdownMenuGroup>
              <DropdownMenuLabel className='flex flex-col gap-0.5 py-1.5'>
                <span className='truncate text-sm font-semibold text-foreground'>{userName}</span>
                <span className='truncate text-xs font-normal text-muted-foreground'>
                  {userEmail}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href='/akun/profil' />}>
                <UserIcon aria-hidden='true' />
                <span>Data Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href='/akun/pengaturan' />}>
                <Settings aria-hidden='true' />
                <span>Pengaturan Akun</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href='/' />}>
                <Store aria-hidden='true' />
                <span>Pasar Panen</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {isAuthenticatedSession && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant='destructive'
                    onClick={async () => {
                      await logoutMutation.mutateAsync()
                      router.push('/')
                    }}
                  >
                    <LogOut aria-hidden='true' />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
