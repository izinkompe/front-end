'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useComplaints } from '@/hooks/api/use-complaints'
import { canReportOrder, isPostPaymentCancelable } from '@/lib/data/complaint-helpers'
import type { Order } from '@/types/api/orders'
import { ComplaintDetailPanel } from './complaint-detail-panel'
import { OrderComplaintDialog } from './order-complaint-dialog'

export function OrderComplaints({ order }: { order: Order }) {
  const { data, isError, refetch } = useComplaints(order.id)
  if (isError) {
    return (
      <Alert variant='destructive'>
        <AlertDescription className='flex flex-wrap items-center justify-between gap-3'>
          <span>Pengaduan gagal dimuat.</span>
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            Muat ulang
          </Button>
        </AlertDescription>
      </Alert>
    )
  }
  if (!data || (!data.length && !canReportOrder(order.status))) return null

  const canSubmit =
    canReportOrder(order.status) &&
    !data.some(({ status }) => status === 'open' || status === 'in_investigation')

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-lg font-semibold text-foreground'>Pengaduan pesanan</h2>
        {order.receiptConfirmedAt && order.status === 'disputed' && canSubmit && (
          <p className='text-sm text-muted-foreground'>
            Laporkan selisih berat agar administrator dapat meninjau pesanan dan pengembalian dana.
          </p>
        )}
      </div>

      {canSubmit && (
        <div className='flex flex-wrap gap-2'>
          <OrderComplaintDialog order={order} />
          {isPostPaymentCancelable(order.status) && (
            <OrderComplaintDialog order={order} cancellation />
          )}
        </div>
      )}

      {data.map((report) => (
        <ComplaintDetailPanel key={report.id} report={report} />
      ))}
    </section>
  )
}
