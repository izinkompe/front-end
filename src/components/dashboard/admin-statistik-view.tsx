'use client'

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCarbonFactors, useDistributionStats } from '@/hooks/api/use-admin'
import { DashboardPageHeader } from './dashboard-page-header'

export function AdminStatistikView() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDistributionStats()
  const { data: factors = [], isLoading: factorsLoading } = useCarbonFactors()

  return (
    <div className='flex flex-col gap-6'>
      <DashboardPageHeader title='Statistik Distribusi' />

      {statsError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>Gagal memuat statistik distribusi platform.</AlertDescription>
        </Alert>
      )}

      {statsLoading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
        </div>
      ) : (
        stats && (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <Card className='min-w-0'>
              <CardHeader className='pb-2'>
                <CardDescription>Total distribusi</CardDescription>
                <CardTitle className='type-kpi font-mono tabular-nums'>
                  {stats.totalDistributedWeightKg.toLocaleString('id-ID')} kg
                </CardTitle>
              </CardHeader>
              <CardContent className='text-meta text-muted-foreground'>
                Pangan terselamatkan: {stats.totalRescuedFoodKg.toLocaleString('id-ID')} kg
              </CardContent>
            </Card>
            <Card className='min-w-0'>
              <CardHeader className='pb-2'>
                <CardDescription>Emisi karbon tercegah</CardDescription>
                <CardTitle className='type-kpi font-mono tabular-nums'>
                  {stats.totalCarbonSavedKgCo2e.toLocaleString('id-ID')} kg CO2e
                </CardTitle>
              </CardHeader>
              <CardContent className='text-meta text-muted-foreground'>
                {stats.totalCompletedTransactions.toLocaleString('id-ID')} transaksi selesai
              </CardContent>
            </Card>
            <Card className='min-w-0'>
              <CardHeader className='pb-2'>
                <CardDescription>Partisipasi pengguna</CardDescription>
                <CardTitle className='type-kpi font-mono tabular-nums'>
                  {stats.activeFarmersCount + stats.activeBuyersCount} akun
                </CardTitle>
              </CardHeader>
              <CardContent className='text-meta text-muted-foreground'>
                {stats.activeFarmersCount} petani · {stats.activeBuyersCount} pembeli
              </CardContent>
            </Card>
          </div>
        )
      )}

      <Card>
        <CardHeader>
          <CardTitle>Faktor Emisi Karbon Komoditas</CardTitle>
        </CardHeader>
        <CardContent>
          {factorsLoading ? (
            <Skeleton className='h-36 w-full' />
          ) : (
            <div className='flex flex-col gap-3'>
              {factors.map((factor) => (
                <Card key={factor.id} size='sm'>
                  <CardContent className='flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
                    <div className='flex min-w-0 flex-col gap-0.5'>
                      <span className='font-medium text-foreground'>{factor.commodityName}</span>
                      <span className='text-meta text-muted-foreground'>
                        {factor.source} · Versi {factor.version}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline'>{factor.category}</Badge>
                      <span className='font-mono text-sm font-semibold text-foreground'>
                        {factor.factorKgCo2ePerKg} kg CO2e/kg
                      </span>
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
