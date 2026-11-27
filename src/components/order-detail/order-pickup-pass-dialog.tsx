'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, ExternalLink, Printer, TicketCheck } from 'lucide-react'
import { formatWeightKg } from '@/components/home/offer-card-helpers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatOrderStatusLabel } from '@/lib/data/checkout-helpers'
import { formatPickupSlotLabel } from '@/lib/data/offer-detail-helpers'
import { buildPickupMapsHref, buildPickupSummaryText } from '@/lib/data/order-pickup-helpers'
import type { Order } from '@/types/api/orders'

interface OrderPickupPassDialogProps {
  order: Order
  showOrganization: boolean
  onPrintPickupPass: () => void
}

export function OrderPickupPassDialog({
  order,
  showOrganization,
  onPrintPickupPass,
}: OrderPickupPassDialogProps) {
  const [open, setOpen] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [copyAnnouncement, setCopyAnnouncement] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastAnnouncementRef = useRef('')

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const mapsHref = buildPickupMapsHref(
    order.pickupLocation.latitude,
    order.pickupLocation.longitude
  )
  const summaryText = buildPickupSummaryText(order, { includeOrganization: showOrganization })

  function announceCopy(message: string) {
    const nextMessage = message === lastAnnouncementRef.current ? `${message}\u00A0` : message
    lastAnnouncementRef.current = nextMessage
    setCopyAnnouncement(nextMessage)
  }

  async function handleCopySummary() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable')
      }
      await navigator.clipboard.writeText(summaryText)
      setCopyState('copied')
      announceCopy('Ringkasan pengambilan disalin.')
    } catch {
      setCopyState('failed')
      announceCopy('Gagal menyalin ringkasan pengambilan.')
    }

    timerRef.current = setTimeout(() => {
      setCopyState('idle')
      setCopyAnnouncement('')
      timerRef.current = null
    }, 2200)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type='button' variant='outline' size='sm' />}>
        <TicketCheck data-icon='inline-start' aria-hidden='true' />
        <span>Kartu pengambilan</span>
      </DialogTrigger>

      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <div className='flex flex-wrap items-center gap-2 pr-8'>
            <Badge variant='secondary'>{formatOrderStatusLabel(order.status)}</Badge>
            <span className='font-mono text-xs text-muted-foreground'>{order.id}</span>
          </div>
          <DialogTitle>Kartu Pengambilan Panen</DialogTitle>
          <DialogDescription>
            Tunjukkan kartu ini di lokasi petani saat pengambilan mandiri.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-5 rounded-xl bg-muted/30 p-4 text-sm'>
          <div className='flex flex-col gap-1'>
            <span className='text-xs text-muted-foreground'>Komoditas</span>
            <p className='text-base font-semibold text-foreground'>{order.commodityName}</p>
            <p className='text-sm font-medium text-primary tabular-nums'>
              {formatWeightKg(order.quantityKg)}
            </p>
          </div>

          <dl className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='flex flex-col gap-0.5'>
              <dt className='text-xs text-muted-foreground'>Jadwal ambil</dt>
              <dd className='font-medium text-foreground tabular-nums'>
                {formatPickupSlotLabel(order.scheduleSlot)}
              </dd>
            </div>

            <div className='flex flex-col gap-0.5'>
              <dt className='text-xs text-muted-foreground'>Petani penyedia</dt>
              <dd className='font-medium text-foreground'>
                {order.farmerName || 'Petani mitra PanganTani'}
              </dd>
            </div>

            <div className='flex flex-col gap-0.5 sm:col-span-2'>
              <dt className='text-xs text-muted-foreground'>Alamat titik ambil</dt>
              <dd className='font-medium text-foreground'>{order.pickupLocation.address}</dd>
              {order.pickupLocation.notes && (
                <dd className='text-xs text-muted-foreground'>
                  Patokan: {order.pickupLocation.notes}
                </dd>
              )}
            </div>

            {(order.buyerContactName || order.buyerContactPhone) && (
              <div className='flex flex-col gap-0.5 sm:col-span-2'>
                <dt className='text-xs text-muted-foreground'>Penanggung jawab pengambilan</dt>
                <dd className='font-medium text-foreground'>
                  {order.buyerContactName || 'Pembeli PanganTani'}
                  {showOrganization && order.buyerOrganization
                    ? ` (${order.buyerOrganization})`
                    : ''}
                </dd>
                {order.buyerContactPhone && (
                  <dd className='text-xs text-muted-foreground tabular-nums'>
                    {order.buyerContactPhone}
                  </dd>
                )}
              </div>
            )}
          </dl>
        </div>

        <DialogFooter className='items-center justify-between gap-2 sm:justify-between'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button type='button' variant='outline' size='sm' onClick={handleCopySummary}>
              {copyState === 'copied' ? (
                <Check data-icon='inline-start' aria-hidden='true' />
              ) : (
                <Copy data-icon='inline-start' aria-hidden='true' />
              )}
              <span>
                {copyState === 'copied'
                  ? 'Tersalin'
                  : copyState === 'failed'
                    ? 'Gagal menyalin'
                    : 'Salin ringkasan'}
              </span>
            </Button>
            <span role='status' aria-live='polite' className='sr-only'>
              {copyAnnouncement}
            </span>

            {mapsHref && (
              <Button
                variant='outline'
                size='sm'
                nativeButton={false}
                render={<a href={mapsHref} target='_blank' rel='noopener noreferrer' />}
              >
                <ExternalLink data-icon='inline-start' aria-hidden='true' />
                <span>Buka peta</span>
              </Button>
            )}
          </div>

          <Button
            type='button'
            size='sm'
            onClick={() => {
              setOpen(false)
              onPrintPickupPass()
            }}
          >
            <Printer data-icon='inline-start' aria-hidden='true' />
            <span>Cetak kartu</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
