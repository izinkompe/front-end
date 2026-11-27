import { describe, expect, it } from 'bun:test'
import {
  canAccessDashboardPath,
  getDefaultDashboardPath,
  hasAnyPermission,
  hasPermission,
  parseUserRole,
  resolvePreviewRoleForPath,
  sanitizeCallbackUrl,
} from './rbac'

describe('rbac policy', () => {
  it('parses valid user roles and rejects unknown values', () => {
    expect(parseUserRole('admin')).toBe('admin')
    expect(parseUserRole('farmer')).toBe('farmer')
    expect(parseUserRole('buyer')).toBe('buyer')
    expect(parseUserRole('superadmin')).toBeNull()
    expect(parseUserRole(null)).toBeNull()
  })

  it('denies dashboard permissions to buyer and null roles', () => {
    expect(hasPermission('buyer', 'dashboard:access')).toBe(false)
    expect(hasPermission('buyer', 'farmer:overview')).toBe(false)
    expect(hasPermission('buyer', 'admin:overview')).toBe(false)
    expect(hasPermission(null, 'dashboard:access')).toBe(false)
  })

  it('isolates farmer and admin permissions strictly', () => {
    expect(hasPermission('farmer', 'farmer:store:manage')).toBe(true)
    expect(hasPermission('farmer', 'admin:farmers:verify')).toBe(false)
    expect(hasPermission('admin', 'admin:farmers:verify')).toBe(true)
    expect(hasPermission('admin', 'farmer:farms:manage')).toBe(false)
    expect(hasAnyPermission('admin', ['farmer:overview', 'admin:overview'])).toBe(true)
  })

  it('enforces route-level RBAC and fails closed on unknown subpaths', () => {
    expect(canAccessDashboardPath('farmer', '/dashboard')).toBe(true)
    expect(canAccessDashboardPath('farmer', '/dashboard/toko')).toBe(true)
    expect(canAccessDashboardPath('farmer', '/dashboard/kebun/123')).toBe(true)
    expect(canAccessDashboardPath('farmer', '/dashboard/papan-kebutuhan')).toBe(true)
    expect(canAccessDashboardPath('farmer', '/dashboard/admin/verifikasi')).toBe(false)

    expect(canAccessDashboardPath('admin', '/dashboard')).toBe(true)
    expect(canAccessDashboardPath('admin', '/dashboard/admin/verifikasi')).toBe(true)
    expect(canAccessDashboardPath('admin', '/dashboard/admin/statistik')).toBe(true)
    expect(canAccessDashboardPath('admin', '/dashboard/toko')).toBe(false)
    expect(canAccessDashboardPath('admin', '/dashboard/papan-kebutuhan')).toBe(false)

    expect(canAccessDashboardPath('buyer', '/dashboard')).toBe(false)
    expect(canAccessDashboardPath('buyer', '/dashboard/papan-kebutuhan')).toBe(false)
    expect(canAccessDashboardPath('buyer', '/dashboard/akses-ditolak')).toBe(true)
    expect(canAccessDashboardPath('admin', '/dashboard/unknown-route')).toBe(false)
  })

  it('sanitizes callback URLs against open redirects', () => {
    expect(sanitizeCallbackUrl('/dashboard/admin/verifikasi?tab=pending')).toBe(
      '/dashboard/admin/verifikasi?tab=pending'
    )
    expect(sanitizeCallbackUrl('//evil.example/phish')).toBe('/dashboard')
    expect(sanitizeCallbackUrl('https://evil.example')).toBe('/dashboard')
    expect(sanitizeCallbackUrl('/\\evil.example')).toBe('/dashboard')
    expect(sanitizeCallbackUrl('javascript:alert(1)')).toBe('/dashboard')
    expect(sanitizeCallbackUrl('/dashboard\nSet-Cookie: a=b')).toBe('/dashboard')
  })

  it('resolves preview role deterministically for relaxed auth', () => {
    expect(resolvePreviewRoleForPath('/dashboard/admin/verifikasi', null)).toBe('admin')
    expect(resolvePreviewRoleForPath('/dashboard/toko', null)).toBe('farmer')
    expect(resolvePreviewRoleForPath('/dashboard', 'buyer')).toBe('buyer')
    expect(getDefaultDashboardPath('admin')).toBe('/dashboard')
    expect(getDefaultDashboardPath('buyer')).toBe('/')
  })
})
