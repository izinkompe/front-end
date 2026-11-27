'use server'

import { cookies } from 'next/headers'
import { DASHBOARD_COOKIES, isAuthRelaxed, parseUserRole } from '@/lib/auth/rbac'
import { env } from '@/lib/env'
import type { UserRole } from '@/types/api/auth'

const isSecureCookie = env.NODE_ENV === 'production'

export async function setSessionRoleCookiesAction(role: UserRole): Promise<void> {
  const validRole = parseUserRole(role)
  if (!validRole) return
  const cookieStore = await cookies()
  cookieStore.set(DASHBOARD_COOKIES.sessionRole, validRole, {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
    secure: isSecureCookie,
    httpOnly: true,
  })
}

export async function clearSessionRoleCookiesAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(DASHBOARD_COOKIES.sessionToken)
  cookieStore.delete(DASHBOARD_COOKIES.sessionRole)
  cookieStore.delete(DASHBOARD_COOKIES.previewRole)
}

export async function setPreviewRoleCookieAction(role: UserRole): Promise<void> {
  if (!isAuthRelaxed()) return
  const validRole = parseUserRole(role)
  if (!validRole) return
  const cookieStore = await cookies()
  cookieStore.set(DASHBOARD_COOKIES.previewRole, validRole, {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
    secure: isSecureCookie,
    httpOnly: false,
  })
}
