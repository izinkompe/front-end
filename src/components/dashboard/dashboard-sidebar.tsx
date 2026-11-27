'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { BrandLogo } from '@/components/shared/brand-logo'
import { Badge } from '@/components/ui/badge'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { getDashboardNavGroups } from '@/components/dashboard/dashboard-nav-config'
import { getRoleLabel } from '@/lib/auth/rbac'
import type { UserRole } from '@/types/api/auth'

interface DashboardSidebarProps {
  role: UserRole
  userName: string
  organization?: string
}

export function DashboardSidebar({ role, userName, organization }: DashboardSidebarProps) {
  const pathname = usePathname()
  const groups = getDashboardNavGroups(role)
  const roleLabel = getRoleLabel(role)

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='border-b border-sidebar-border px-3 py-3'>
        <div className='flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center'>
          <BrandLogo
            href='/dashboard'
            ariaLabel='PanganTani - Ringkasan Dashboard'
            variant='sidebar'
            size='sm'
            wordmarkClassName='truncate group-data-[collapsible=icon]:hidden'
          />
          <Badge variant='secondary' className='shrink-0 group-data-[collapsible=icon]:hidden'>
            {roleLabel}
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                      >
                        <Icon className='icon-sm' aria-hidden='true' />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className='border-t border-sidebar-border p-3'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip='Lihat Pasar Panen' render={<Link href='/' />}>
              <ExternalLink className='icon-sm' aria-hidden='true' />
              <span>Pasar Panen</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className='flex flex-col gap-0.5 px-2 pt-1 group-data-[collapsible=icon]:hidden'>
          <span className='truncate text-sm font-medium text-sidebar-foreground'>{userName}</span>
          {organization && (
            <span className='truncate text-meta text-muted-foreground'>{organization}</span>
          )}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
