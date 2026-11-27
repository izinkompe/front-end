'use client'

import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFarmerFarm } from '@/hooks/api/use-farmer-management'
import { DashboardPageHeader } from '../dashboard-page-header'
import { FarmFormContent } from './farmer-farm-form-content'

export function FarmerFarmFormView({ farmId }: { farmId?: string }) {
  const isEdit = Boolean(farmId)
  const { data: farm, isLoading, isError } = useFarmerFarm(farmId ?? '')

  return (
    <div className='flex flex-col gap-6'>
      <DashboardPageHeader
        title={isEdit ? 'Sunting Kebun' : 'Tambah Kebun Baru'}
        actions={
          <Button variant='outline' nativeButton={false} render={<Link href='/dashboard/kebun' />}>
            <ArrowLeft data-icon='inline-start' aria-hidden='true' />
            <span>Kembali ke Kebun Saya</span>
          </Button>
        }
      />

      {isEdit && isLoading ? (
        <Skeleton className='h-96 max-w-3xl' />
      ) : isEdit && (isError || !farm) ? (
        <Alert variant='destructive' className='max-w-3xl'>
          <AlertCircle />
          <AlertDescription>Data kebun tidak ditemukan atau gagal dimuat.</AlertDescription>
        </Alert>
      ) : (
        <FarmFormContent key={farm?.id ?? 'new'} farm={farm} />
      )}
    </div>
  )
}
