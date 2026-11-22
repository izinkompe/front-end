'use client'

import { useState } from 'react'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardHeader } from './dashboard-header'

export function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className='flex min-h-screen bg-background text-foreground'>
      <DashboardSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className='flex flex-1 flex-col min-w-0'>
        <DashboardHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className='flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto'>{children}</main>
      </div>
    </div>
  )
}
