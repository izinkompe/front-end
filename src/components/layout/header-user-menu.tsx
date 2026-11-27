'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, LogOut, MapPin, Settings, ShoppingBag, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { getUserInitials, isSafeAvatarUrl } from '@/lib/data/profile-helpers'
import { cn } from '@/lib/utils'
import type { User as UserType } from '@/types/api/auth'

interface HeaderUserMenuProps {
  user: UserType
  pathname: string
  isTransparent: boolean
  transparentIconClass: string
}

export function HeaderUserMenu({
  user,
  pathname,
  isTransparent,
  transparentIconClass,
}: HeaderUserMenuProps) {
  const router = useRouter()
  const logoutMutation = useLogout()
  const avatarSrc = isSafeAvatarUrl(user.avatarUrl)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className={cn(
              'touch-target size-10 rounded-full p-0',
              isTransparent && transparentIconClass
            )}
            aria-label={`Menu akun ${user.name}`}
          />
        }
      >
        <Avatar size='lg'>
          {avatarSrc && <AvatarImage src={avatarSrc} alt={user.name} />}
          <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
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
            <span className='truncate text-sm font-semibold text-foreground'>{user.name}</span>
            <span className='truncate text-meta font-normal text-muted-foreground'>
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className='min-h-11 sm:min-h-9' render={<Link href='/akun' />}>
            <ShoppingBag className='icon-sm' aria-hidden='true' />
            <span>Pesanan Saya</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='min-h-11 sm:min-h-9' render={<Link href='/akun/profil' />}>
            <User className='icon-sm' aria-hidden='true' />
            <span>Data Profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='min-h-11 sm:min-h-9' render={<Link href='/akun/alamat' />}>
            <MapPin className='icon-sm' aria-hidden='true' />
            <span>Alamat Tersimpan</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='min-h-11 sm:min-h-9'
            render={<Link href='/akun/pengaturan' />}
          >
            <Settings className='icon-sm' aria-hidden='true' />
            <span>Pengaturan</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {(user.role === 'farmer' || user.role === 'admin') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className='min-h-11 sm:min-h-9' render={<Link href='/dashboard' />}>
                <LayoutDashboard className='icon-sm' aria-hidden='true' />
                <span>Dashboard Mitra</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant='destructive'
            className='min-h-11 sm:min-h-9'
            onClick={async () => {
              await logoutMutation.mutateAsync()
              if (pathname.startsWith('/akun') || pathname.startsWith('/dashboard')) {
                router.push('/')
              }
            }}
          >
            <LogOut className='icon-sm' aria-hidden='true' />
            <span>Keluar</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
