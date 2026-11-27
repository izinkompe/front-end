'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { RelaxedAuthBanner } from '@/components/dashboard/relaxed-auth-banner'
import { DashboardAccessDenied, DashboardAuthRequired } from '@/components/dashboard/role-gate'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useHydrated } from '@/hooks/use-hydrated'
import {
  canAccessDashboardPath,
  getRoleLabel,
  isAuthRelaxed,
  resolvePreviewRoleForPath,
} from '@/lib/auth/rbac'
import { getPreviewRoleCookie } from '@/lib/auth/session-cookies'
import type { UserRole } from '@/types/api/auth'

const PREVIEW_USER_META: Record<UserRole, { name: string; email: string; organization?: string }> =
  {
    farmer: {
      name: 'Pak Joko (Pratinjau)',
      email: 'joko@suburmakmur.id',
      organization: 'Kelompok Tani Subur Makmur',
    },
    admin: {
      name: 'Admin Operasional (Pratinjau)',
      email: 'admin@pangantani.id',
      organization: 'Tim Operasional PanganTani',
    },
    buyer: {
      name: 'Ibu Ratna (Pratinjau)',
      email: 'ratna@dapurkasih.org',
      organization: 'Dapur Umum Yayasan Kasih',
    },
  }

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const { data: currentUser, isLoading } = useCurrentUser()
  const [previewRoleOverride, setPreviewRoleOverride] = useState<UserRole | null>(null)
  const relaxed = isAuthRelaxed()

  if (!hydrated || isLoading) {
    return (
      <>
        <div className='flex min-h-screen flex-col gap-4 p-6'>
          <Skeleton className='h-12 w-full' />
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-32 w-full' />
          </div>
        </div>
        <div className='hidden' aria-hidden='true'>
          {children}
        </div>
      </>
    )
  }

  if (!currentUser && !relaxed) {
    return <DashboardAuthRequired nextPath={pathname} />
  }

  const resolvedPreviewRole =
    previewRoleOverride ?? resolvePreviewRoleForPath(pathname, getPreviewRoleCookie())
  const activeRole: UserRole = currentUser ? currentUser.role : resolvedPreviewRole
  const previewMeta = PREVIEW_USER_META[activeRole]
  const userName = currentUser?.name ?? previewMeta.name
  const userEmail = currentUser?.email ?? previewMeta.email
  const organization = currentUser?.organization ?? previewMeta.organization
  const isPathAllowed = canAccessDashboardPath(activeRole, pathname)

  if (activeRole === 'buyer' && !isPathAllowed) {
    return (
      <div className='mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-4 p-4 sm:p-6'>
        <RelaxedAuthBanner
          activeRole={activeRole}
          onPreviewRoleChange={(next) => setPreviewRoleOverride(next)}
        />
        <DashboardAccessDenied roleLabel={getRoleLabel(activeRole)} homeHref='/' />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <a href='#konten-utama' className='skip-link'>
          Lewati ke konten utama
        </a>
        <DashboardSidebar role={activeRole} userName={userName} organization={organization} />
        <SidebarInset className='min-w-0'>
          <DashboardHeader
            role={activeRole}
            userName={userName}
            userEmail={userEmail}
            avatarUrl={currentUser?.avatarUrl}
            isAuthenticatedSession={Boolean(currentUser)}
          />
          <div className='flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6'>
            <RelaxedAuthBanner
              activeRole={activeRole}
              onPreviewRoleChange={(next) => setPreviewRoleOverride(next)}
            />
            {isPathAllowed ? (
              <main id='konten-utama' tabIndex={-1} className='flex min-w-0 flex-1 flex-col gap-6'>
                {children}
              </main>
            ) : (
              <main id='konten-utama' tabIndex={-1} className='flex min-w-0 flex-1 flex-col'>
                <DashboardAccessDenied roleLabel={getRoleLabel(activeRole)} homeHref='/' />
              </main>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
