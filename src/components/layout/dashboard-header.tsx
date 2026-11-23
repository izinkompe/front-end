'use client'

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { GlobalBreadcrumb } from './global-breadcrumb'
import { cn } from '@/lib/utils'

export function DashboardHeader() {
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === 'collapsed' && !isMobile

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 sm:px-4 md:px-6 backdrop-blur transition-[height] duration-200 ease-linear supports-backdrop-filter:bg-background/80',
        isCollapsed ? 'h-12' : 'h-16'
      )}
    >
      <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
        <SidebarTrigger />
        <GlobalBreadcrumb />
      </div>
    </header>
  )
}
