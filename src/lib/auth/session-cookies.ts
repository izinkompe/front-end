import { DASHBOARD_COOKIES, isAuthRelaxed, parseUserRole } from '@/lib/auth/rbac'
import type { User, UserRole } from '@/types/api/auth'

function buildCookieAttributes(maxAgeSeconds: number): string {
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  return `Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`
}

export function setSessionRoleCookies(role: UserRole, _token?: string): void {
  if (typeof document === 'undefined') return
  const attrs = buildCookieAttributes(60 * 60 * 24)
  document.cookie = `${DASHBOARD_COOKIES.sessionRole}=${encodeURIComponent(role)}; ${attrs}`
}

export function getCachedAuthUser(): User | null {
  return null
}

export function setCachedAuthUser(_user: User | null): void {
  return
}

export function clearSessionRoleCookies(): void {
  setCachedAuthUser(null)
  if (typeof document === 'undefined') return
  const attrs = buildCookieAttributes(0)
  document.cookie = `${DASHBOARD_COOKIES.sessionToken}=; ${attrs}`
  document.cookie = `${DASHBOARD_COOKIES.sessionRole}=; ${attrs}`
  document.cookie = `${DASHBOARD_COOKIES.previewRole}=; ${attrs}`
}

export function setPreviewRoleCookie(role: UserRole): void {
  if (typeof document === 'undefined' || !isAuthRelaxed()) return
  const attrs = buildCookieAttributes(60 * 60 * 24)
  document.cookie = `${DASHBOARD_COOKIES.previewRole}=${encodeURIComponent(role)}; ${attrs}`
}

export function getPreviewRoleCookie(): UserRole | null {
  if (typeof document === 'undefined' || !isAuthRelaxed()) return null
  const prefix = `${DASHBOARD_COOKIES.previewRole}=`
  const entry = document.cookie.split('; ').find((item) => item.startsWith(prefix))
  if (!entry) return null
  return parseUserRole(decodeURIComponent(entry.slice(prefix.length)))
}
