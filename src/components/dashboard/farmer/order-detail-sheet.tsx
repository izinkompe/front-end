'use client'

import { useState } from 'react'
import { CalendarClock, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { useFarmerOrderComplaints, useMarkOrderReady } from '@/hooks/api/use-farmer'
import { analyzeWeightDiscrepancy } from '@/lib/data/order-pickup-helpers'
import type { Order, OrderStatus } from '@/types/api/orders'
import {
  ComplaintClarificationForm,
  RestockDecisionForm,
  ScheduleProposalForm,
} from './order-action-forms'

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Menunggu Pembayaran',
  payment_submitted: 'Bukti Terkirim',
  processing: 'Perlu Disiapkan',
  ready_for_pickup: 'Siap Diambil',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  disputed: 'Dalam Tinjauan',
}

export function OrderDetailSheet({
  order,
  onOpenChange,
}: {
  order: Order | null
  onOpenChange: (open: boolean) => void
}) {
  const [notice, setNotice] = useState<string | null>(null)
  const markReady = useMarkOrderReady(order?.id ?? '')
  const { data: complaints = [] } = useFarmerOrderComplaints(order?.id)

  if (!order) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent side='right' />
      </Sheet>
    )
  }

  const weightInfo =
    order.confirmedWeightKg !== undefined
      ? analyzeWeightDiscrepancy(order.quantityKg, order.confirmedWeightKg, order.pricePerKg)
      : null

  return (
    <Sheet open={Boolean(order)} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='sm:max-w-xl'>
        <SheetHeader>
          <SheetTitle>Detail pesanan {order.commodityName}</SheetTitle>
        </SheetHeader>

        <div className='flex flex-col gap-5 p-4'>
          {notice && (
            <Alert>
              <CheckCircle2 />
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          )}

          <div className='flex flex-wrap items-center justify-between gap-2'>
            <span className='font-mono text-meta text-muted-foreground'>{order.id}</span>
            <Badge variant={order.status === 'processing' ? 'default' : 'secondary'}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>

          <Card size='sm'>
            <CardContent>
              <dl className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
                <div>
                  <dt className='text-meta text-muted-foreground'>Pembeli</dt>
                  <dd className='font-medium text-foreground'>
                    {order.buyerContactName || '-'}
                    {order.buyerOrganization ? ` (${order.buyerOrganization})` : ''}
                  </dd>
                </div>
                <div>
                  <dt className='text-meta text-muted-foreground'>Kontak pembeli</dt>
                  <dd className='font-mono text-foreground'>{order.buyerContactPhone || '-'}</dd>
                </div>
                <div>
                  <dt className='text-meta text-muted-foreground'>Berat dipesan</dt>
                  <dd className='font-mono font-semibold text-foreground tabular-nums'>
                    {order.quantityKg.toLocaleString('id-ID')} kg
                  </dd>
                </div>
                <div>
                  <dt className='text-meta text-muted-foreground'>Total nilai transaksi</dt>
                  <dd className='font-mono font-semibold text-foreground tabular-nums'>
                    Rp {order.totalPrice.toLocaleString('id-ID')}
                  </dd>
                </div>
                <div>
                  <dt className='text-meta text-muted-foreground'>Jadwal pengambilan</dt>
                  <dd className='text-foreground tabular-nums'>
                    {order.scheduleSlot.date} ({order.scheduleSlot.startTime}–
                    {order.scheduleSlot.endTime})
                  </dd>
                </div>
                <div>
                  <dt className='text-meta text-muted-foreground'>Lokasi titik ambil</dt>
                  <dd className='text-foreground'>{order.pickupLocation.address}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {order.proposedScheduleSlot && (
            <Alert>
              <CalendarClock />
              <AlertDescription>
                Usulan jadwal baru: {order.proposedScheduleSlot.date} (
                {order.proposedScheduleSlot.startTime}–{order.proposedScheduleSlot.endTime}) ·
                Status: {order.scheduleProposalStatus ?? 'pending'}
              </AlertDescription>
            </Alert>
          )}

          {weightInfo && (
            <Alert>
              <CheckCircle2 />
              <AlertTitle>
                Berat aktual diterima: {order.confirmedWeightKg?.toLocaleString('id-ID')} kg
              </AlertTitle>
              {weightInfo.hasDiscrepancy && order.weightDiscrepancyNote && (
                <AlertDescription>{order.weightDiscrepancyNote}</AlertDescription>
              )}
            </Alert>
          )}

          {order.status === 'processing' && (
            <Button
              disabled={markReady.isPending}
              onClick={() =>
                markReady.mutate(undefined, {
                  onSuccess: () => setNotice('Pesanan ditandai siap diambil oleh pembeli.'),
                })
              }
            >
              {markReady.isPending ? (
                <Spinner data-icon='inline-start' />
              ) : (
                <CheckCircle2 data-icon='inline-start' aria-hidden='true' />
              )}
              <span>Tandai siap diambil</span>
            </Button>
          )}

          {['processing', 'ready_for_pickup'].includes(order.status) && (
            <div className='pt-2'>
              <ScheduleProposalForm key={order.id} order={order} onSuccess={setNotice} />
            </div>
          )}

          {order.status === 'cancelled' && !order.restockDecision && (
            <div className='pt-2'>
              <RestockDecisionForm key={order.id} order={order} onSuccess={setNotice} />
            </div>
          )}

          {order.status === 'cancelled' && order.restockDecision && (
            <Alert>
              <AlertDescription>
                Keputusan stok batal:{' '}
                {order.restockDecision === 'restocked'
                  ? 'Dikembalikan ke stok tersedia'
                  : 'Tidak dikembalikan karena kondisi menurun'}
              </AlertDescription>
            </Alert>
          )}

          {complaints.map((complaint) => (
            <div key={complaint.id} className='flex flex-col gap-3 pt-2'>
              <ComplaintClarificationForm complaint={complaint} onSuccess={setNotice} />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
