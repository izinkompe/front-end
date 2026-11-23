'use client'

import Link from 'next/link'
import { User, Settings, Bell, BadgeCheck, LogOut, ChevronsUpDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import type { ActorProfile } from './dashboard-navigation-data'

interface NavUserProps {
  user: ActorProfile
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const isFarmer = user.badgeVariant === 'success'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                className='h-auto py-2 hover:bg-sidebar-accent'
                tooltip={`${user.name} (${user.roleTitle})`}
              />
            }
          >
            <Avatar className='shrink-0'>
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden'>
              <span className='truncate font-semibold text-sidebar-foreground'>{user.name}</span>
              <span className='truncate text-[10px] text-muted-foreground'>{user.email}</span>
            </div>
            <ChevronsUpDown className='ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden' />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='min-w-64 rounded-none'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='p-2 font-normal'>
                <div className='flex items-center gap-2.5 text-left'>
                  <Avatar className='shrink-0'>
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-xs leading-tight min-w-0'>
                    <div className='flex items-center justify-between gap-1'>
                      <span className='truncate font-semibold text-foreground'>{user.name}</span>
                      <Badge variant={user.badgeVariant} className='text-[10px] py-0 px-1.5'>
                        {user.roleTitle}
                      </Badge>
                    </div>
                    <span className='truncate text-[10px] text-muted-foreground'>{user.email}</span>
                    <span className='truncate text-[10px] text-muted-foreground/80'>
                      {user.organization}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link href={isFarmer ? '/dashboard/pengaturan' : '/dashboard/admin'} />}
              >
                <User />
                <span>Profil Akun</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                render={
                  <Link
                    href={isFarmer ? '/dashboard/verifikasi' : '/dashboard/admin/verifikasi-petani'}
                  />
                }
              >
                <BadgeCheck />
                <span>Status Verifikasi</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                render={<Link href={isFarmer ? '/dashboard/pengaturan' : '/dashboard/admin'} />}
              >
                <Settings />
                <span>Pengaturan Sistem</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                render={
                  <Link href={isFarmer ? '/dashboard/pesanan' : '/dashboard/admin/pengaduan'} />
                }
              >
                <Bell />
                <span className='flex-1'>Pusat Pemberitahuan</span>
                <span className='size-2 rounded-full bg-primary' />
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant='destructive' render={<Link href='/' />}>
              <LogOut />
              <span>Keluar Akun</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
