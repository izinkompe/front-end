import { NextResponse, type NextRequest } from 'next/server'
import {
  canAccessDashboardPath,
  DASHBOARD_COOKIES,
  isAuthRelaxed,
  parseUserRole,
  resolvePreviewRoleForPath,
  sanitizeCallbackUrl,
} from '@/lib/auth/rbac'

function applyDashboardSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return response
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const sessionToken = request.cookies.get(DASHBOARD_COOKIES.sessionToken)?.value
  const sessionRole = parseUserRole(request.cookies.get(DASHBOARD_COOKIES.sessionRole)?.value)
  const previewRole = parseUserRole(request.cookies.get(DASHBOARD_COOKIES.previewRole)?.value)

  if (!isAuthRelaxed()) {
    if (!sessionToken || !sessionRole) {
      const loginPath =
        pathname === '/dashboard/admin' || pathname.startsWith('/dashboard/admin/')
          ? '/masuk-admin'
          : '/masuk-petani'
      const loginUrl = new URL(loginPath, request.url)
      loginUrl.searchParams.set('next', sanitizeCallbackUrl(`${pathname}${search}`))
      return applyDashboardSecurityHeaders(NextResponse.redirect(loginUrl))
    }

    if (!canAccessDashboardPath(sessionRole, pathname)) {
      const deniedUrl = new URL('/dashboard/akses-ditolak', request.url)
      return applyDashboardSecurityHeaders(NextResponse.redirect(deniedUrl))
    }

    return applyDashboardSecurityHeaders(NextResponse.next())
  }

  const activeRole =
    sessionToken && sessionRole ? sessionRole : resolvePreviewRoleForPath(pathname, previewRole)

  if (!canAccessDashboardPath(activeRole, pathname)) {
    const deniedUrl = new URL('/dashboard/akses-ditolak', request.url)
    return applyDashboardSecurityHeaders(NextResponse.redirect(deniedUrl))
  }

  return applyDashboardSecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
