'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { formatPlainRupiah, formatWeightKg } from '@/components/home/offer-card-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useUpdateNeedStatus } from '@/hooks/api/use-needs-board'
import { useOfferDetail } from '@/hooks/api/use-offers'
import {
  getNeedCheckoutHref,
  getRemainingNeedKg,
  isActiveNeed,
  needStatusLabels,
} from '@/lib/data/needs-board-helpers'
import type { NeedRequest, NeedResponse, UpdateNeedStatus } from '@/types/api/needs-board'

export function formatNeedDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(
    new Date(date)
  )
}

function NeedStatusAction({ need, status }: { need: NeedRequest; status: UpdateNeedStatus }) {
  const [open, setOpen] = useState(false)
  const update = useUpdateNeedStatus()
  const label = status === 'fulfilled' ? 'Tandai terpenuhi' : 'Tutup permintaan'
  const isClosing = status === 'closed'

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant='outline' size='sm' />}>
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{label}?</AlertDialogTitle>
          <AlertDialogDescription>
            {isClosing
              ? 'Permintaan yang ditutup tidak lagi tampil di daftar permintaan aktif.'
              : 'Permintaan akan ditandai selesai terpenuhi dan dihapus dari daftar aktif.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {update.isError && (
          <Alert variant='destructive'>
            <AlertDescription>{update.error.message}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel autoFocus>Kembali</AlertDialogCancel>
          <AlertDialogAction
            variant={isClosing ? 'destructive' : 'default'}
            disabled={update.isPending}
            onClick={() =>
              update.mutate({ id: need.id, status }, { onSuccess: () => setOpen(false) })
            }
          >
            {update.isPending && <Spinner data-icon='inline-start' />}
            <span>{label}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function NeedResponseCheckout({
  need,
  response,
  isOwner,
  isActive,
}: {
  need: NeedRequest
  response: NeedResponse
  isOwner: boolean
  isActive: boolean
}) {
  const { data: offer, isPending, isError, refetch } = useOfferDetail(response.offerId)
  if (isPending) {
    return (
      <p role='status' className='text-sm text-muted-foreground'>
        Memeriksa ketersediaan penawaran…
      </p>
    )
  }
  if (isError) {
    return (
      <Button variant='outline' size='sm' onClick={() => refetch()}>
        Periksa ulang penawaran
      </Button>
    )
  }

  const href = getNeedCheckoutHref(need, response, offer)
  const offerHref = '/pasar/penawaran/' + encodeURIComponent(response.offerId)

  return (
    <div className='flex flex-col gap-2'>
      {offer && (
        <p className='text-xs text-muted-foreground tabular-nums'>
          Stok tersedia saat ini: {formatWeightKg(offer.availableStockKg)}
        </p>
      )}
      <div className='flex flex-wrap items-center gap-2'>
        {isOwner && isActive && (
          <>
            {href ? (
              <Button size='sm' nativeButton={false} render={<Link href={href} />}>
                Pilih dan lanjut ke checkout
              </Button>
            ) : (
              <p className='text-sm text-muted-foreground'>
                Penawaran ini sudah tidak tersedia atau stok habis.
              </p>
            )}
          </>
        )}
        {offer && (
          <Button
            variant='outline'
            size='sm'
            nativeButton={false}
            render={<Link href={offerHref} />}
          >
            <ExternalLink data-icon='inline-start' aria-hidden='true' />
            <span>Lihat penawaran</span>
          </Button>
        )}
      </div>
    </div>
  )
}

export function NeedDetailPanel({
  need,
  isOwner,
  closeHref,
}: {
  need: NeedRequest
  isOwner: boolean
  closeHref?: string
}) {
  const isActive = isActiveNeed(need)
  const fulfilledKg = need.fulfilledQuantityKg ?? 0
  const progressPercent =
    need.neededQuantityKg > 0
      ? Math.min(100, Math.round((fulfilledKg / need.neededQuantityKg) * 100))
      : 0

  return (
    <Card>
      <CardHeader className='gap-2'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex min-w-0 flex-wrap items-center gap-2'>
            <Badge variant='outline'>{need.category}</Badge>
            <Badge variant={isActive ? 'secondary' : 'outline'}>
              {needStatusLabels[need.status]}
            </Badge>
          </div>
          {closeHref && (
            <Button
              variant='ghost'
              size='icon'
              className='shrink-0'
              aria-label='Tutup detail permintaan'
              nativeButton={false}
              render={<Link href={closeHref} scroll={false} />}
            >
              <X className='size-4' aria-hidden='true' />
            </Button>
          )}
        </div>
        <CardTitle className='text-xl wrap-anywhere'>{need.commodityName}</CardTitle>
        <CardDescription>{need.organization || need.buyerName}</CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-5'>
        <dl className='grid gap-3 text-sm sm:grid-cols-2'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-sm text-muted-foreground'>Berat dibutuhkan</dt>
            <dd className='font-semibold text-foreground tabular-nums'>
              {formatWeightKg(need.neededQuantityKg)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-sm text-muted-foreground'>Wilayah pengambilan</dt>
            <dd className='text-foreground'>{need.targetArea}</dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-sm text-muted-foreground'>Tanggal dibutuhkan</dt>
            <dd className='text-foreground tabular-nums'>{formatNeedDate(need.targetDate)}</dd>
          </div>
          {need.maxPricePerKg !== undefined && (
            <div className='flex flex-col gap-0.5'>
              <dt className='text-sm text-muted-foreground'>Harga maksimum per kg</dt>
              <dd className='font-medium text-foreground tabular-nums'>
                {formatPlainRupiah(need.maxPricePerKg)}
              </dd>
            </div>
          )}
        </dl>

        {fulfilledKg > 0 && (
          <div className='flex flex-col gap-1.5 rounded-md border border-border bg-muted/30 p-3 text-sm'>
            <div className='flex items-center justify-between gap-2 tabular-nums'>
              <span className='font-medium text-foreground'>
                Terpenuhi {formatWeightKg(fulfilledKg)}
              </span>
              <span className='text-muted-foreground'>
                Sisa {formatWeightKg(getRemainingNeedKg(need))} ({progressPercent}%)
              </span>
            </div>
            <Progress value={progressPercent} aria-label='Progres pemenuhan kebutuhan' />
          </div>
        )}

        {need.notes && (
          <p className='text-sm wrap-anywhere whitespace-pre-wrap text-foreground'>{need.notes}</p>
        )}

        {isOwner && isActive && (
          <div className='flex flex-wrap gap-2'>
            <NeedStatusAction need={need} status='fulfilled' />
            <NeedStatusAction need={need} status='closed' />
          </div>
        )}

        <Separator />

        <section className='flex flex-col gap-3'>
          <h3 className='font-semibold text-foreground'>
            Tanggapan petani ({need.responses?.length ?? 0})
          </h3>
          {!need.responses?.length && (
            <p className='text-sm text-muted-foreground'>Belum ada tanggapan dari petani.</p>
          )}
          {!!need.responses?.length && (
            <ul className='divide-y divide-border'>
              {need.responses.map((response) => (
                <li key={response.id} className='flex flex-col gap-2 py-3 first:pt-0 last:pb-0'>
                  <div className='flex flex-wrap items-baseline justify-between gap-2'>
                    <h4 className='font-semibold text-foreground'>{response.farmerName}</h4>
                    <span className='text-sm font-semibold text-primary tabular-nums'>
                      {formatPlainRupiah(response.offeredPricePerKg)}/kg
                    </span>
                  </div>
                  <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground tabular-nums'>
                    <span>Menawarkan {formatWeightKg(response.offeredQuantityKg)}</span>
                    <span className='text-muted-foreground'>
                      Tersedia {formatNeedDate(response.availableDate)}
                    </span>
                  </div>
                  {response.message && (
                    <p className='text-sm wrap-anywhere text-muted-foreground'>
                      {response.message}
                    </p>
                  )}
                  <NeedResponseCheckout
                    need={need}
                    response={response}
                    isOwner={isOwner}
                    isActive={isActive}
                  />
                </li>
              ))}
            </ul>
          )}

          {isActive && !isOwner && (
            <Button
              variant='outline'
              className='self-start'
              nativeButton={false}
              render={<Link href='/masuk-petani' />}
            >
              Tanggapi sebagai petani
            </Button>
          )}
        </section>
      </CardContent>
    </Card>
  )
}
