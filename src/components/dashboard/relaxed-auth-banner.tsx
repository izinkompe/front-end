'use client'

import { useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useSwitchPreviewRole } from '@/hooks/api/use-auth'
import { isAuthRelaxed, parseUserRole } from '@/lib/auth/rbac'
import type { UserRole } from '@/types/api/auth'

interface RelaxedAuthBannerProps {
  activeRole: UserRole
  onPreviewRoleChange?: (role: UserRole) => void
}

export function RelaxedAuthBanner({ activeRole, onPreviewRoleChange }: RelaxedAuthBannerProps) {
  const router = useRouter()
  const switchPreviewRole = useSwitchPreviewRole()

  if (!isAuthRelaxed()) {
    return null
  }

  function handleRoleChange(values: string[]) {
    const nextRole = parseUserRole(values[0])
    if (!nextRole || nextRole === activeRole) return

    switchPreviewRole.mutate(nextRole, {
      onSuccess: () => {
        onPreviewRoleChange?.(nextRole)
        if (nextRole === 'farmer' || nextRole === 'admin') {
          router.push('/dashboard')
        }
        router.refresh()
      },
    })
  }

  return (
    <Alert className='border-border bg-muted/50'>
      <ShieldAlert />
      <AlertTitle>Mode autentikasi dilonggarkan untuk pratinjau</AlertTitle>
      <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <span className='text-sm text-muted-foreground'>
          API autentikasi backend belum terhubung. Pengaturan RBAC tetap aktif untuk menguji batas
          akses antar peran, dan wajib diperketat lewat NEXT_PUBLIC_AUTH_RELAXED=false saat API
          siap.
        </span>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-meta font-medium text-foreground'>Simulasi peran:</span>
          <ToggleGroup
            value={[activeRole]}
            onValueChange={handleRoleChange}
            variant='outline'
            size='sm'
            className='flex-wrap'
            aria-label='Pilih peran pratinjau dashboard'
          >
            <ToggleGroupItem value='farmer' disabled={switchPreviewRole.isPending}>
              Petani
            </ToggleGroupItem>
            <ToggleGroupItem value='admin' disabled={switchPreviewRole.isPending}>
              Admin
            </ToggleGroupItem>
            <ToggleGroupItem value='buyer' disabled={switchPreviewRole.isPending}>
              Pembeli
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </AlertDescription>
    </Alert>
  )
}
