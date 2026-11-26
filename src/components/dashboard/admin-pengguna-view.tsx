'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAdminUsers } from '@/hooks/api/use-admin'
import { getRoleLabel } from '@/lib/auth/rbac'
import type { UserRole } from '@/types/api/auth'

export function AdminPenggunaView() {
  const { data: users = [], isLoading, isError } = useAdminUsers()
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')

  const filtered = roleFilter === 'all' ? users : users.filter((user) => user.role === roleFilter)

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl font-semibold text-foreground'>Pengguna & Akses</h1>
          <p className='text-base text-muted-foreground'>
            Daftar akun terdaftar beserta peran RBAC yang berlaku pada sesi masing-masing.
          </p>
        </div>

        <ToggleGroup
          value={[roleFilter]}
          onValueChange={(values) => {
            const next = values[0] as 'all' | UserRole | undefined
            if (next) setRoleFilter(next)
          }}
          variant='outline'
          size='sm'
        >
          <ToggleGroupItem value='all'>Semua ({users.length})</ToggleGroupItem>
          <ToggleGroupItem value='admin'>Admin</ToggleGroupItem>
          <ToggleGroupItem value='farmer'>Petani</ToggleGroupItem>
          <ToggleGroupItem value='buyer'>Pembeli</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>Gagal memuat daftar pengguna.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Akun Platform</CardTitle>
          <CardDescription>
            Menampilkan {filtered.length} akun sesuai filter peran aktif.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className='h-48 w-full' />
          ) : (
            <div className='flex flex-col gap-3'>
              {filtered.map((user) => (
                <div
                  key={user.id}
                  className='flex flex-col justify-between gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center'
                >
                  <div className='flex flex-col gap-0.5'>
                    <span className='font-medium text-foreground'>{user.name}</span>
                    <span className='text-xs text-muted-foreground'>
                      {user.email}
                      {user.organization ? ` · ${user.organization}` : ''}
                    </span>
                  </div>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {getRoleLabel(user.role)}
                    </Badge>
                    {user.role === 'farmer' && (
                      <Badge variant='outline'>
                        {user.isVerifiedFarmer ? 'Terverifikasi' : 'Menunggu'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
