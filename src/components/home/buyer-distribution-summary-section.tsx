'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDistributionStats } from '@/hooks/api/use-admin'
import { formatWeightKg } from './offer-card-helpers'

const integerFormatter = new Intl.NumberFormat('id-ID')

const pickupSteps: ReadonlyArray<{ title: string; detail: string }> = [
  {
    title: 'Pesan berat sesuai kebutuhan',
    detail: 'Satu pesanan untuk satu petani. Sistem mengunci stok selama batas waktu transfer.',
  },
  {
    title: 'Transfer dan unggah bukti bayar',
    detail: 'Anda transfer ke rekening petani yang tercatat, lalu admin memeriksa buktinya.',
  },
  {
    title: 'Ambil mandiri di lokasi petani',
    detail:
      'Setelah pembayaran terverifikasi, alamat lengkap dan patokan pengambilan terbuka di detail pesanan.',
  },
  {
    title: 'Catat berat aktual di lokasi',
    detail:
      'Timbang bersama petani lalu catat berat yang Anda terima agar transaksi selesai tercatat.',
  },
]

function DistributionMetricSkeleton() {
  return (
    <div
      role='status'
      aria-label='Memuat ringkasan pangan tersalurkan'
      className='flex flex-col gap-3'
    >
      <Skeleton className='h-12 w-56 rounded-lg' />
      <Skeleton className='h-5 w-72' />
      <Skeleton className='h-4 w-64' />
    </div>
  )
}

export function BuyerDistributionSummarySection() {
  const { data: stats, isPending, isError, refetch } = useDistributionStats()

  return (
    <section className='w-full bg-primary/8 text-foreground'>
      <div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:px-8'>
        <div className='flex flex-col justify-between gap-6 lg:col-span-5'>
          <div className='flex flex-col gap-3'>
            <h2 id='distribution-summary-heading' className='type-h2 text-foreground'>
              Pangan tersalurkan
            </h2>

            {isPending ? (
              <DistributionMetricSkeleton />
            ) : isError || !stats ? (
              <Alert className='border-border bg-card text-card-foreground'>
                <AlertCircle aria-hidden='true' />
                <AlertTitle>Gagal memuat ringkasan distribusi</AlertTitle>
                <AlertDescription className='flex flex-col gap-3'>
                  <span>Muat ulang untuk melihat total pangan tersalurkan.</span>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => refetch()}
                    className='w-fit'
                  >
                    <RefreshCw data-icon='inline-start' aria-hidden='true' />
                    Muat ulang
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className='flex flex-col gap-3'>
                <p className='type-kpi text-primary'>
                  {formatWeightKg(stats.totalDistributedWeightKg)}
                </p>
                <p className='max-w-[56ch] text-base leading-relaxed text-foreground tabular-nums'>
                  Dari {integerFormatter.format(stats.totalCompletedTransactions)} transaksi selesai
                  bersama {integerFormatter.format(stats.activeFarmersCount)} petani dan{' '}
                  {integerFormatter.format(stats.activeBuyersCount)} pembeli aktif.
                </p>
              </div>
            )}
          </div>

          <p className='max-w-[56ch] text-sm leading-relaxed text-muted-foreground'>
            Sistem menghitung angka ini satu kali per transaksi selesai, mengikuti berat aktual yang
            pembeli konfirmasi saat serah terima.
          </p>
        </div>

        <div className='flex flex-col gap-4 lg:col-span-7'>
          <h3 className='text-lg leading-snug font-bold text-foreground'>
            Alur pengambilan mandiri
          </h3>

          <ol className='flex flex-col divide-y divide-border border-t border-b border-border'>
            {pickupSteps.map((step, index) => (
              <li
                key={step.title}
                className='grid grid-cols-[1.75rem_minmax(0,1fr)] items-baseline gap-3 py-4'
              >
                <span className='text-base font-bold text-primary tabular-nums'>{index + 1}</span>
                <div className='flex flex-col gap-1'>
                  <p className='text-base leading-snug font-semibold text-foreground'>
                    {step.title}
                  </p>
                  <p className='max-w-[62ch] text-sm leading-relaxed text-muted-foreground'>
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
