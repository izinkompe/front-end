import { DASHBOARD_COOKIES, isAuthRelaxed, parseUserRole } from '@/lib/auth/rbac'
import { UserSchema, type User, type UserRole } from '@/types/api/auth'

const AUTH_USER_CACHE_KEY = 'pangantani:cached-user'

function buildCookieAttributes(maxAgeSeconds: number): string {
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  return `Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`
}

export function setSessionRoleCookies(role: UserRole, token = 'mock-session'): void {
  if (typeof document === 'undefined') return
  const attrs = buildCookieAttributes(60 * 60 * 24)
  document.cookie = `${DASHBOARD_COOKIES.sessionToken}=${encodeURIComponent(token)}; ${attrs}`
  document.cookie = `${DASHBOARD_COOKIES.sessionRole}=${encodeURIComponent(role)}; ${attrs}`
}

export function getCachedAuthUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(AUTH_USER_CACHE_KEY)
    if (!raw) return null
    const parsed = UserSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      window.localStorage.removeItem(AUTH_USER_CACHE_KEY)
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

export function setCachedAuthUser(user: User | null): void {
  if (typeof window === 'undefined') return
  try {
    if (user) {
      window.localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(AUTH_USER_CACHE_KEY)
    }
  } catch {
    return
  }
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
