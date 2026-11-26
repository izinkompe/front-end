'use client'

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCarbonFactors, useDistributionStats } from '@/hooks/api/use-admin'

export function AdminStatistikView() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDistributionStats()
  const { data: factors = [], isLoading: factorsLoading } = useCarbonFactors()

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-1'>
        <h1 className='font-heading text-2xl font-semibold text-foreground'>
          Statistik Distribusi
        </h1>
        <p className='text-base text-muted-foreground'>
          Volume pangan terselamatkan dan faktor konversi emisi karbon per kategori komoditas.
        </p>
      </div>

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
            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Total distribusi</CardDescription>
                <CardTitle className='font-mono text-2xl tabular-nums'>
                  {stats.totalDistributedWeightKg.toLocaleString('id-ID')} kg
                </CardTitle>
              </CardHeader>
              <CardContent className='text-xs text-muted-foreground'>
                Pangan terselamatkan: {stats.totalRescuedFoodKg.toLocaleString('id-ID')} kg
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Emisi karbon tercegah</CardDescription>
                <CardTitle className='font-mono text-2xl tabular-nums'>
                  {stats.totalCarbonSavedKgCo2e.toLocaleString('id-ID')} kg CO2e
                </CardTitle>
              </CardHeader>
              <CardContent className='text-xs text-muted-foreground'>
                {stats.totalCompletedTransactions.toLocaleString('id-ID')} transaksi selesai
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Partisipasi pengguna</CardDescription>
                <CardTitle className='font-mono text-2xl tabular-nums'>
                  {stats.activeFarmersCount + stats.activeBuyersCount} akun
                </CardTitle>
              </CardHeader>
              <CardContent className='text-xs text-muted-foreground'>
                {stats.activeFarmersCount} petani · {stats.activeBuyersCount} pembeli
              </CardContent>
            </Card>
          </div>
        )
      )}

      <Card>
        <CardHeader>
          <CardTitle>Faktor Emisi Karbon Komoditas</CardTitle>
          <CardDescription>
            Referensi perhitungan jejak karbon per kilogram pangan yang terselamatkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {factorsLoading ? (
            <Skeleton className='h-36 w-full' />
          ) : (
            <div className='flex flex-col gap-3'>
              {factors.map((factor) => (
                <div
                  key={factor.id}
                  className='flex flex-col justify-between gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center'
                >
                  <div className='flex flex-col gap-0.5'>
                    <span className='font-medium text-foreground'>{factor.commodityName}</span>
                    <span className='text-xs text-muted-foreground'>
                      {factor.source} · Versi {factor.version}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline'>{factor.category}</Badge>
                    <span className='font-mono text-sm font-semibold text-foreground'>
                      {factor.factorKgCo2ePerKg} kg CO2e/kg
                    </span>
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
