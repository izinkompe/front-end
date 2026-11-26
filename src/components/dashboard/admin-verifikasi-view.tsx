'use client'

import { useState } from 'react'
import { AlertCircle, ShieldCheck, ShieldOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAdminFarmers, useVerifyAdminFarmer } from '@/hooks/api/use-admin'

export function AdminVerifikasiView() {
  const { data: farmers = [], isLoading, isError } = useAdminFarmers()
  const verifyFarmer = useVerifyAdminFarmer()
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all')

  const filtered = farmers.filter((item) => {
    if (filter === 'pending') return !item.isVerifiedFarmer
    if (filter === 'verified') return item.isVerifiedFarmer
    return true
  })

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl font-semibold text-foreground'>Verifikasi Petani</h1>
          <p className='text-base text-muted-foreground'>
            Tinjau profil usaha, wilayah lahan, dan status kelayakan mitra petani.
          </p>
        </div>

        <ToggleGroup
          value={[filter]}
          onValueChange={(values) => {
            const next = values[0] as 'all' | 'pending' | 'verified' | undefined
            if (next) setFilter(next)
          }}
          variant='outline'
          size='sm'
        >
          <ToggleGroupItem value='all'>Semua ({farmers.length})</ToggleGroupItem>
          <ToggleGroupItem value='pending'>
            Menunggu ({farmers.filter((item) => !item.isVerifiedFarmer).length})
          </ToggleGroupItem>
          <ToggleGroupItem value='verified'>Terverifikasi</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>Gagal memuat data petani untuk verifikasi.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Skeleton className='h-48 w-full' />
          <Skeleton className='h-48 w-full' />
        </div>
      ) : filtered.length === 0 ? (
        <Empty className='border border-border bg-card'>
          <EmptyHeader>
            <EmptyTitle>Tidak ada data petani</EmptyTitle>
            <EmptyDescription>
              Tidak ada akun petani yang sesuai dengan filter status verifikasi ini.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {filtered.map((farmer) => (
            <Card key={farmer.id}>
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex flex-col gap-1'>
                    <CardTitle>{farmer.organization || farmer.name}</CardTitle>
                    <CardDescription>
                      {farmer.name} · {farmer.email}
                    </CardDescription>
                  </div>
                  <Badge variant={farmer.isVerifiedFarmer ? 'default' : 'secondary'}>
                    {farmer.isVerifiedFarmer ? 'Terverifikasi' : 'Menunggu'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='grid grid-cols-2 gap-3 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Wilayah</p>
                  <p className='font-medium text-foreground'>{farmer.areaName || '-'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Bank penerima</p>
                  <p className='font-medium text-foreground'>{farmer.bankName || '-'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Tipe mitra</p>
                  <p className='text-foreground'>{farmer.farmerType || 'individual'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Onboarding</p>
                  <p className='text-foreground'>
                    {farmer.onboardingCompleted ? 'Lengkap' : 'Belum lengkap'}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={farmer.isVerifiedFarmer ? 'outline' : 'default'}
                  disabled={verifyFarmer.isPending}
                  onClick={() =>
                    verifyFarmer.mutate({
                      farmerId: farmer.id,
                      isVerifiedFarmer: !farmer.isVerifiedFarmer,
                    })
                  }
                >
                  {verifyFarmer.isPending ? (
                    <Spinner data-icon='inline-start' />
                  ) : farmer.isVerifiedFarmer ? (
                    <ShieldOff data-icon='inline-start' />
                  ) : (
                    <ShieldCheck data-icon='inline-start' />
                  )}
                  <span>{farmer.isVerifiedFarmer ? 'Cabut verifikasi' : 'Setujui verifikasi'}</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
