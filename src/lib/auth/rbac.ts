import { env } from '@/lib/env'
import type { UserRole } from '@/types/api/auth'

export type Permission =
  | 'dashboard:access'
  | 'farmer:overview'
  | 'farmer:store:manage'
  | 'farmer:farms:manage'
  | 'farmer:offers:manage'
  | 'farmer:orders:manage'
  | 'admin:overview'
  | 'admin:farmers:verify'
  | 'admin:offers:moderate'
  | 'admin:stats:view'
  | 'admin:users:manage'

export const DASHBOARD_COOKIES = {
  sessionToken: 'pt_session',
  sessionRole: 'pt_role',
  previewRole: 'pt_preview_role',
} as const

export const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<Permission>> = {
  buyer: new Set<Permission>(),
  farmer: new Set<Permission>([
    'dashboard:access',
    'farmer:overview',
    'farmer:store:manage',
    'farmer:farms:manage',
    'farmer:offers:manage',
    'farmer:orders:manage',
  ]),
  admin: new Set<Permission>([
    'dashboard:access',
    'admin:overview',
    'admin:farmers:verify',
    'admin:offers:moderate',
    'admin:stats:view',
    'admin:users:manage',
  ]),
}

interface RoutePolicy {
  prefix: string
  roles: ReadonlyArray<UserRole>
}

const DASHBOARD_ROUTE_POLICIES: ReadonlyArray<RoutePolicy> = [
  { prefix: '/dashboard/admin', roles: ['admin'] },
  { prefix: '/dashboard/toko', roles: ['farmer'] },
  { prefix: '/dashboard/kebun', roles: ['farmer'] },
  { prefix: '/dashboard/penawaran', roles: ['farmer'] },
  { prefix: '/dashboard/pesanan', roles: ['farmer'] },
]

export function isAuthRelaxed(): boolean {
  return env.NEXT_PUBLIC_AUTH_RELAXED
}

export function parseUserRole(value: unknown): UserRole | null {
  if (value === 'buyer' || value === 'farmer' || value === 'admin') {
    return value
  }
  return null
}

export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role].has(permission)
}

export function hasAnyPermission(
  role: UserRole | null | undefined,
  permissions: ReadonlyArray<Permission>
): boolean {
  if (!role) return false
  const allowed = ROLE_PERMISSIONS[role]
  return permissions.some((permission) => allowed.has(permission))
}

function normalizePathname(pathname: string): string {
  const pathOnly = pathname.split(/[?#]/)[0] || '/'
  if (pathOnly.length > 1 && pathOnly.endsWith('/')) {
    return pathOnly.slice(0, -1)
  }
  return pathOnly
}

export function canAccessDashboardPath(
  role: UserRole | null | undefined,
  pathname: string
): boolean {
  const normalized = normalizePathname(pathname)
  if (normalized === '/dashboard/akses-ditolak') {
    return true
  }
  if (!role || !hasPermission(role, 'dashboard:access')) {
    return false
  }
  if (normalized === '/dashboard') {
    return true
  }
  for (const policy of DASHBOARD_ROUTE_POLICIES) {
    if (normalized === policy.prefix || normalized.startsWith(`${policy.prefix}/`)) {
      return policy.roles.includes(role)
    }
  }
  return false
}

export function getDefaultDashboardPath(role: UserRole | null | undefined): string {
  if (role === 'admin' || role === 'farmer') {
    return '/dashboard'
  }
  return '/'
}

export function getRoleLabel(role: UserRole): string {
  if (role === 'admin') return 'Admin'
  if (role === 'farmer') return 'Petani'
  return 'Pembeli'
}

export function resolvePreviewRoleForPath(pathname: string, cookieRole: UserRole | null): UserRole {
  if (cookieRole) {
    return cookieRole
  }
  const normalized = normalizePathname(pathname)
  if (normalized === '/dashboard/admin' || normalized.startsWith('/dashboard/admin/')) {
    return 'admin'
  }
  return 'farmer'
}

function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    if (code < 32 || code === 127) {
      return true
    }
  }
  return false
}

export function sanitizeCallbackUrl(
  input: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!input) return fallback
  const trimmed = input.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback
  }
  if (hasControlChars(trimmed)) {
    return fallback
  }
  try {
    const parsed = new URL(trimmed, 'http://localhost')
    if (parsed.origin !== 'http://localhost' || !parsed.pathname.startsWith('/')) {
      return fallback
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
