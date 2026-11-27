'use client'

import { useRouter } from 'next/navigation'
import { DashboardUserMenu } from '@/components/dashboard/dashboard-user-menu'
import { HeaderNotificationsPopover } from '@/components/layout/header-notifications-popover'
import { SidebarTrigger } from '@/components/ui/sidebar'
import type { UserRole } from '@/types/api/auth'

interface DashboardHeaderProps {
  role: UserRole
  userName: string
  userEmail: string
  avatarUrl?: string
  isAuthenticatedSession: boolean
}

export function DashboardHeader({
  role,
  userName,
  userEmail,
  avatarUrl,
  isAuthenticatedSession,
}: DashboardHeaderProps) {
  const router = useRouter()

  return (
    <header className='sticky top-0 z-20 flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-sm'>
      <div className='flex min-w-0 items-center'>
        <SidebarTrigger aria-label='Buka atau tutup menu samping' />
      </div>

      <div className='flex shrink-0 items-center gap-2'>
        <HeaderNotificationsPopover
          signedIn={isAuthenticatedSession}
          onSignIn={() => router.push('/masuk-petani')}
        />

        <DashboardUserMenu
          role={role}
          userName={userName}
          userEmail={userEmail}
          avatarUrl={avatarUrl}
          isAuthenticatedSession={isAuthenticatedSession}
        />
      </div>
    </header>
  )
}
