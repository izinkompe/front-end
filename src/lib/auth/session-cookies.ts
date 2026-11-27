import { DASHBOARD_COOKIES, isAuthRelaxed, parseUserRole } from '@/lib/auth/rbac'
import {
  clearSessionRoleCookiesAction,
  setPreviewRoleCookieAction,
  setSessionRoleCookiesAction,
} from '@/lib/auth/session-cookies-actions'
import type { User, UserRole } from '@/types/api/auth'

export async function setSessionRoleCookies(role: UserRole, _token?: string): Promise<void> {
  if (typeof window === 'undefined') return
  await setSessionRoleCookiesAction(role)
}

export function getCachedAuthUser(): User | null {
  return null
}

export function setCachedAuthUser(_user: User | null): void {
  return
}

export async function clearSessionRoleCookies(): Promise<void> {
  setCachedAuthUser(null)
  if (typeof window === 'undefined') return
  await clearSessionRoleCookiesAction()
}

export async function setPreviewRoleCookie(role: UserRole): Promise<void> {
  if (typeof window === 'undefined' || !isAuthRelaxed()) return
  await setPreviewRoleCookieAction(role)
}

export function getPreviewRoleCookie(): UserRole | null {
  if (typeof document === 'undefined' || !isAuthRelaxed()) return null
  const prefix = `${DASHBOARD_COOKIES.previewRole}=`
  const entry = document.cookie.split('; ').find((item) => item.startsWith(prefix))
  if (!entry) return null
  return parseUserRole(decodeURIComponent(entry.slice(prefix.length)))
}
