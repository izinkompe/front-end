'use client'

import { usePathname } from 'next/navigation'
import { AdminOverview } from '@/components/dashboard/admin-overview'
import { FarmerOverview } from '@/components/dashboard/farmer-overview'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { resolvePreviewRoleForPath } from '@/lib/auth/rbac'
import { getPreviewRoleCookie } from '@/lib/auth/session-cookies'

export function DashboardOverview() {
  const pathname = usePathname()
  const { data: currentUser } = useCurrentUser()
  const activeRole =
    currentUser?.role ?? resolvePreviewRoleForPath(pathname, getPreviewRoleCookie())

  if (activeRole === 'admin') {
    return <AdminOverview user={currentUser} />
  }

  return <FarmerOverview user={currentUser} />
}
