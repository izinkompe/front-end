'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sprout } from 'lucide-react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavMain, type NavMainItem } from './dashboard-sidebar-nav-main'
import { NavUser } from './dashboard-sidebar-nav-user'
import { DashboardSidebarNotifications } from './dashboard-sidebar-notifications'
import { KebunSwitcher } from './kebun-switcher'
import {
  getDashboardActor,
  farmerNavItems,
  adminNavItems,
  farmerProfile,
  adminProfile,
} from './dashboard-navigation-data'
import { cn } from '@/lib/utils'

export function DashboardSidebar() {
  const pathname = usePathname() ?? ''
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === 'collapsed' && !isMobile
  const actor = getDashboardActor(pathname)
  const isFarmer = actor === 'farmer'
  const profile = isFarmer ? farmerProfile : adminProfile
  const rawNavItems = isFarmer ? farmerNavItems : adminNavItems

  const navItems: NavMainItem[] = rawNavItems.map((item) => {
    const isParentActive =
      pathname === item.url ||
      (item.url !== '/dashboard' &&
        item.url !== '/dashboard/admin' &&
        pathname.startsWith(item.url))

    const subItems = item.items?.map((sub) => ({
      ...sub,
      isActive: pathname === sub.url,
    }))

    const hasActiveChild = subItems?.some((sub) => sub.isActive) ?? false

    return {
      ...item,
      isActive: isParentActive || hasActiveChild,
      defaultOpen: true,
      items: subItems,
    }
  })

  return (
    <Sidebar collapsible='icon' variant='sidebar'>
      <SidebarHeader
        className={cn(
          'justify-center border-b p-2 transition-[height] duration-200 ease-linear',
          isCollapsed ? 'h-12' : 'h-16'
        )}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip='PanganTani - Beranda'
              render={<Link href='/' />}
              className='h-auto py-1.5 hover:bg-sidebar-accent focus-visible:ring-1 focus-visible:ring-sidebar-ring'
            >
              <div className='flex aspect-square size-8 shrink-0 items-center justify-center bg-primary text-primary-foreground'>
                <Sprout className='size-5' />
              </div>
              <div className='grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden'>
                <span className='truncate font-semibold font-heading text-sm text-sidebar-foreground'>
                  PanganTani
                </span>
                <span className='truncate text-[10px] text-muted-foreground'>
                  {isFarmer ? 'Panel Petani Mitra' : 'Panel Administrator'}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className='gap-0'>
        {isFarmer && (
          <div className='p-2 border-b group-data-[collapsible=icon]:hidden'>
            <KebunSwitcher variant='sidebar' />
          </div>
        )}
        <NavMain
          label={isFarmer ? 'Aktivitas Petani' : 'Operasional Administrator'}
          items={navItems}
        />
      </SidebarContent>

      <SidebarFooter className='p-2 border-t gap-1'>
        <DashboardSidebarNotifications actor={actor} userId={profile.id} />
        <NavUser user={profile} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
