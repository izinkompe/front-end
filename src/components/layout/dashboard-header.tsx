'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { RoleSwitcher } from './role-switcher'
import { GlobalBreadcrumb } from './global-breadcrumb'
import { getDashboardActor, farmerProfile, adminProfile } from './dashboard-navigation-data'
import { cn } from '@/lib/utils'

export function DashboardHeader() {
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === 'collapsed' && !isMobile
  const actor = getDashboardActor(pathname)
  const isFarmer = actor === 'farmer'
  const profile = isFarmer ? farmerProfile : adminProfile

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 sm:px-4 md:px-6 backdrop-blur transition-[height] duration-200 ease-linear supports-backdrop-filter:bg-background/80',
        isCollapsed ? 'h-12' : 'h-16'
      )}
    >
      <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
        <SidebarTrigger />
        <Separator orientation='vertical' className='h-4 hidden sm:block' />
        <GlobalBreadcrumb />
      </div>

      <div className='flex items-center gap-2 sm:gap-3 shrink-0'>
        <RoleSwitcher variant='header' />

        <Button
          variant='ghost'
          size='icon'
          className='relative text-muted-foreground hover:text-foreground'
          aria-label='Pemberitahuan sistem'
        >
          <Bell className='size-4' />
          <span className='absolute top-1.5 right-1.5 size-2 bg-primary' />
        </Button>

        <Avatar className='border border-border'>
          <AvatarFallback>{profile.initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
