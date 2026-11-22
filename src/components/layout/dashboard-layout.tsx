'use client'

import * as React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardHeader } from './dashboard-header'

export function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider defaultOpen>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className='flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 overflow-y-auto bg-background'>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
