'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { AlertCircle, Calendar, CheckCircle2, Clock, MapPin, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useNeedsBoard } from '@/hooks/api/use-needs-board'
import type { NeedRequest } from '@/types/api/needs-board'
import {
  buildNeedDetailHref,
  formatTargetDateLabel,
  getNeedFulfillmentSummary,
  getNeedStatusMeta,
} from './home-discovery-helpers'
import { formatPricePerKg, formatWeightKg } from './offer-card-helpers'

const MAX_VISIBLE_NEEDS = 4

function NeedsBoardSkeleton() {
  return (
    <div
      role='status'
      aria-label='Memuat daftar papan kebutuhan pangan'
      className='grid grid-cols-1 gap-4 sm:grid-cols-2'
    >
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className='flex h-full flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5'
        >
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between gap-2'>
              <Skeleton className='h-6 w-24 rounded-lg' />
              <Skeleton className='h-6 w-28 rounded-lg' />
            </div>
            <div className='flex flex-col gap-1.5'>
              <Skeleton className='h-4 w-36' />
              <Skeleton className='h-5 w-4/5' />
            </div>
            <div className='flex items-center justify-between gap-2'>
              <Skeleton className='h-5 w-24' />
              <Skeleton className='h-5 w-28' />
            </div>
            <Skeleton className='h-6 w-full rounded-full' />
          </div>
          <Skeleton className='h-4 w-full' />
        </div>
      ))}
    </div>
  )
}

interface NeedRequestCardProps {
  need: NeedRequest
}

function NeedRequestCard({ need }: NeedRequestCardProps) {
  const fulfillment = getNeedFulfillmentSummary(need)
  const statusMeta = getNeedStatusMeta(need.status)
  const detailHref = buildNeedDetailHref(need.id)
  const requesterLabel = need.organization?.trim() || need.buyerName
  const isPartiallyFulfilled = need.status === 'partially_fulfilled'

  return (
    <article className='relative flex h-full flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-shadow has-[a.need-card-link:hover]:shadow-md has-[a.need-card-link:focus-visible]:outline-2 has-[a.need-card-link:focus-visible]:outline-offset-2 has-[a.need-card-link:focus-visible]:outline-ring'>
      <div className='flex flex-col gap-3'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <Badge variant='secondary' className='rounded-lg px-2.5 py-0.5 text-sm'>
            {need.category}
          </Badge>
          <Badge
            variant={isPartiallyFulfilled ? 'default' : 'outline'}
            className='rounded-lg px-2.5 py-0.5 text-sm'
          >
            {isPartiallyFulfilled ? (
              <CheckCircle2 data-icon='inline-start' aria-hidden='true' />
            ) : (
              <Clock data-icon='inline-start' aria-hidden='true' />
            )}
            <span>{statusMeta.label}</span>
          </Badge>
        </div>

        <header className='flex flex-col gap-1'>
          <p className='truncate text-sm font-medium text-muted-foreground'>{requesterLabel}</p>
          <h3 className='line-clamp-2 text-lg leading-snug font-bold text-foreground'>
            <Link
              href={detailHref}
              className='need-card-link outline-none after:absolute after:inset-0 after:content-[""]'
            >
              {need.commodityName}
            </Link>
          </h3>
        </header>

        <div className='flex flex-wrap items-baseline justify-between gap-2'>
          <span className='text-base font-bold text-foreground tabular-nums'>
            Butuh {formatWeightKg(need.neededQuantityKg)}
          </span>
          {typeof need.maxPricePerKg === 'number' && (
            <span className='text-sm font-semibold text-primary tabular-nums'>
              Maks. {formatPricePerKg(need.maxPricePerKg)}
            </span>
          )}
        </div>

        <Progress value={fulfillment.percent} className='gap-2'>
          <ProgressLabel className='text-sm font-medium text-muted-foreground tabular-nums'>
            {fulfillment.offeredKg > 0
              ? `${formatWeightKg(fulfillment.offeredKg)} ditanggapi`
              : 'Belum ditanggapi'}
          </ProgressLabel>
          <ProgressValue className='text-sm font-semibold text-foreground' />
        </Progress>
      </div>

      <div className='flex flex-col gap-3'>
        <Separator />
        <footer className='flex items-center justify-between gap-2 text-sm text-muted-foreground'>
          <span className='flex min-w-0 items-center gap-1.5'>
            <MapPin className='size-4 shrink-0' aria-hidden='true' />
            <span className='truncate'>{need.targetArea}</span>
          </span>
          <span className='flex shrink-0 items-center gap-1.5 tabular-nums'>
            <Calendar className='size-4 shrink-0' aria-hidden='true' />
            <span>{formatTargetDateLabel(need.targetDate)}</span>
          </span>
        </footer>
      </div>
    </article>
  )
}

export function BuyerNeedsBoardSection() {
  const { data: needs, isPending, isError, refetch } = useNeedsBoard()

  const activeNeeds = useMemo(() => {
    const items = needs ?? []
    return items
      .filter((item) => item.status === 'open' || item.status === 'partially_fulfilled')
      .slice(0, MAX_VISIBLE_NEEDS)
  }, [needs])

  return (
    <section className='w-full bg-background text-foreground'>
      <div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-12 lg:items-start lg:px-8'>
        <div className='flex flex-col gap-5 lg:col-span-4'>
          <div className='flex flex-col gap-2'>
            <h2
              id='needs-board-heading'
              className='text-[clamp(1.5rem,1.25rem+0.9vw,2rem)] leading-tight font-bold text-foreground'
            >
              Papan Kebutuhan Pangan
            </h2>
            <p className='max-w-[60ch] text-base leading-relaxed text-muted-foreground'>
              Belum menemukan panen atau jumlah yang Anda cari? Pasang daftar kebutuhan di sini agar
              petani sekitar bisa menawarkan stok mereka.
            </p>
          </div>

          <div className='flex flex-col gap-2.5 sm:flex-row lg:flex-col'>
            <Button
              variant='default'
              nativeButton={false}
              render={<Link href='/papan-kebutuhan' />}
            >
              Pasang kebutuhan pangan
            </Button>
            <Button variant='outline' nativeButton={false} render={<Link href='/masuk-petani' />}>
              Tanggapi sebagai petani
            </Button>
          </div>
        </div>

        <div className='flex flex-col gap-4 lg:col-span-8'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <p className='text-sm font-medium text-muted-foreground tabular-nums'>
              {isPending ? 'Memuat permintaan aktif...' : `${activeNeeds.length} permintaan aktif`}
            </p>

            <Link
              href='/papan-kebutuhan'
              className='inline-flex min-h-10 w-fit items-center rounded-md px-2 py-1.5 text-base font-semibold text-primary transition-opacity pointer-coarse:min-h-11 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
            >
              Lihat semua permintaan
            </Link>
          </div>

          {isPending ? (
            <NeedsBoardSkeleton />
          ) : isError ? (
            <Alert className='border-border bg-card text-card-foreground'>
              <AlertCircle aria-hidden='true' />
              <AlertTitle>Gagal memuat Papan Kebutuhan Pangan</AlertTitle>
              <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <span>Muat ulang untuk melihat daftar permintaan aktif.</span>
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
          ) : activeNeeds.length === 0 ? (
            <div className='flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-muted/50 p-6 sm:flex-row sm:items-center'>
              <div className='flex flex-col gap-1'>
                <h3 className='text-lg leading-snug font-semibold text-foreground'>
                  Belum ada permintaan aktif
                </h3>
                <p className='max-w-[60ch] text-base leading-relaxed text-muted-foreground'>
                  Pasang kebutuhan panen untuk dapur, katering, atau usaha kuliner Anda.
                </p>
              </div>
              <Button
                variant='default'
                size='sm'
                nativeButton={false}
                render={<Link href='/papan-kebutuhan' />}
              >
                Pasang kebutuhan pangan
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {activeNeeds.map((need) => (
                <NeedRequestCard key={need.id} need={need} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
