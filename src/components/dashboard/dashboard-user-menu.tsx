'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, LogOut, Settings, Store, User as UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { useLogout } from '@/hooks/api/use-auth'
import { getRoleLabel, isAuthRelaxed } from '@/lib/auth/rbac'
import { getUserInitials, isSafeAvatarUrl } from '@/lib/data/profile-helpers'
import type { UserRole } from '@/types/api/auth'

interface DashboardUserMenuProps {
  role: UserRole
  userName: string
  userEmail: string
  avatarUrl?: string
  isAuthenticatedSession: boolean
}

export function DashboardUserMenu({
  role,
  userName,
  userEmail,
  avatarUrl,
  isAuthenticatedSession,
}: DashboardUserMenuProps) {
  const router = useRouter()
  const logoutMutation = useLogout()
  const avatarSrc = isSafeAvatarUrl(avatarUrl)
  const roleLabel = getRoleLabel(role)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className='touch-target size-10 rounded-full p-0'
            aria-label={`Menu akun ${userName}`}
          />
        }
      >
        <Avatar size='lg'>
          {avatarSrc && <AvatarImage src={avatarSrc} alt={userName} />}
          <AvatarFallback>{getUserInitials(userName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={8}
        collisionPadding={12}
        className='w-64 max-w-[calc(100vw-1.5rem)]'
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className='flex flex-col gap-1.5 py-2'>
            <div className='flex items-center justify-between gap-2'>
              <span className='truncate text-sm font-semibold text-foreground'>{userName}</span>
              <Badge variant='secondary' className='shrink-0'>
                {roleLabel}
              </Badge>
            </div>
            <span className='truncate text-meta font-normal text-muted-foreground'>
              {userEmail}
            </span>
            {isAuthRelaxed() && (
              <Badge variant='outline' className='w-fit'>
                Auth Longgar
              </Badge>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className='min-h-11 sm:min-h-9' render={<Link href='/dashboard' />}>
            <LayoutDashboard className='icon-sm' aria-hidden='true' />
            <span>Ringkasan Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='min-h-11 sm:min-h-9'
            render={<Link href='/dashboard/profil' />}
          >
            <UserIcon className='icon-sm' aria-hidden='true' />
            <span>Data Profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='min-h-11 sm:min-h-9'
            render={<Link href='/akun/pengaturan' />}
          >
            <Settings className='icon-sm' aria-hidden='true' />
            <span>Pengaturan Akun</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='min-h-11 sm:min-h-9' render={<Link href='/' />}>
            <Store className='icon-sm' aria-hidden='true' />
            <span>Pasar Panen</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {isAuthenticatedSession && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant='destructive'
                className='min-h-11 sm:min-h-9'
                onClick={async () => {
                  await logoutMutation.mutateAsync()
                  router.push('/')
                }}
              >
                <LogOut className='icon-sm' aria-hidden='true' />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
