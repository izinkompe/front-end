'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminUsers } from '@/hooks/api/use-admin'
import { getRoleLabel } from '@/lib/auth/rbac'
import type { UserRole } from '@/types/api/auth'
import { DashboardFilterSelect } from './dashboard-filter-select'
import { DashboardPageHeader } from './dashboard-page-header'

export function AdminPenggunaView() {
  const { data: users = [], isLoading, isError } = useAdminUsers()
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')

  const filtered = roleFilter === 'all' ? users : users.filter((user) => user.role === roleFilter)

  return (
    <div className='flex flex-col gap-6'>
      <DashboardPageHeader
        title='Pengguna & Akses'
        actions={
          <DashboardFilterSelect
            ariaLabel='Filter peran pengguna'
            value={roleFilter}
            onValueChange={setRoleFilter}
            options={[
              { value: 'all', label: `Semua peran (${users.length})` },
              { value: 'admin', label: 'Admin' },
              { value: 'farmer', label: 'Petani' },
              { value: 'buyer', label: 'Pembeli' },
            ]}
          />
        }
      />

      {isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>Gagal memuat daftar pengguna.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Akun Platform</CardTitle>
          <CardDescription>{filtered.length} akun</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className='h-48 w-full' />
          ) : (
            <div className='flex flex-col gap-3'>
              {filtered.map((user) => (
                <Card key={user.id} size='sm'>
                  <CardContent className='flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
                    <div className='flex min-w-0 flex-col gap-0.5'>
                      <span className='font-medium text-foreground'>{user.name}</span>
                      <span className='break-words text-meta text-muted-foreground'>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
