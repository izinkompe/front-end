'use client'

import Link from 'next/link'
import { AlertCircle, Lock, RefreshCw, ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { hasPermission, type Permission } from '@/lib/auth/rbac'
import type { UserRole } from '@/types/api/auth'

interface RoleGateProps {
  role: UserRole | null | undefined
  permission?: Permission
  allowedRoles?: ReadonlyArray<UserRole>
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RoleGate({
  role,
  permission,
  allowedRoles,
  fallback = null,
  children,
}: RoleGateProps) {
  if (!role) return <>{fallback}</>
  if (permission && !hasPermission(role, permission)) return <>{fallback}</>
  if (allowedRoles && !allowedRoles.includes(role)) return <>{fallback}</>
  return <>{children}</>
}

export function DashboardAccessDenied({
  roleLabel,
  homeHref = '/',
}: {
  roleLabel?: string
  homeHref?: string
}) {
  return (
    <div className='flex min-h-[60vh] items-center justify-center p-4'>
      <Empty className='max-w-md border border-border bg-card'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <ShieldX />
          </EmptyMedia>
          <EmptyTitle>Akses ke halaman ini ditolak</EmptyTitle>
          <EmptyDescription>
            {roleLabel
              ? `Peran ${roleLabel} tidak memiliki izin untuk membuka area ini.`
              : 'Akun Anda tidak memiliki izin untuk membuka area ini.'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className='flex flex-wrap items-center justify-center gap-2'>
            <Button variant='outline' nativeButton={false} render={<Link href={homeHref} />}>
              Kembali ke Pasar Panen
            </Button>
            {(roleLabel === 'Petani' || roleLabel === 'Admin') && (
              <Button nativeButton={false} render={<Link href='/dashboard' />}>
                Buka Ringkasan
              </Button>
            )}
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}

export function DashboardAuthRequired({ nextPath }: { nextPath: string }) {
  const encodedNext = encodeURIComponent(nextPath)
  const farmerLoginHref = `/masuk-petani?next=${encodedNext}`
  const adminLoginHref = `/masuk-admin?next=${encodedNext}`
  return (
    <div className='flex min-h-[70vh] items-center justify-center p-4'>
      <Empty className='max-w-md border border-border bg-card'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Lock />
          </EmptyMedia>
          <EmptyTitle>Autentikasi diperlukan</EmptyTitle>
          <EmptyDescription>
            Masuk dengan akun Petani atau Admin untuk mengakses dashboard pengelolaan.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className='flex flex-wrap items-center justify-center gap-2'>
            <Button nativeButton={false} render={<Link href={farmerLoginHref} />}>
              Masuk Petani
            </Button>
            <Button variant='outline' nativeButton={false} render={<Link href={adminLoginHref} />}>
              Masuk Admin
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}

export function DashboardAuthError({
  error,
  nextPath,
  onRetry,
}: {
  error: unknown
  nextPath: string
  onRetry: () => void
}) {
  const encodedNext = encodeURIComponent(nextPath)
  const farmerLoginHref = `/masuk-petani?next=${encodedNext}`
  const message =
    error instanceof Error && error.message
      ? error.message
      : 'Terjadi kesalahan saat memverifikasi sesi akun Anda.'

  return (
    <div className='flex min-h-[70vh] items-center justify-center p-4'>
      <Empty className='max-w-md border border-destructive/30 bg-card'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <AlertCircle className='text-destructive' />
          </EmptyMedia>
          <EmptyTitle>Verifikasi sesi gagal</EmptyTitle>
          <EmptyDescription>{message}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className='flex flex-wrap items-center justify-center gap-2'>
            <Button type='button' onClick={onRetry}>
              <RefreshCw data-icon='inline-start' />
              Coba Lagi
            </Button>
            <Button variant='outline' nativeButton={false} render={<Link href={farmerLoginHref} />}>
              Masuk Ulang
            </Button>
            <Button variant='ghost' nativeButton={false} render={<Link href='/' />}>
              Beranda
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}
