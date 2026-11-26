'use client'

import { Download } from 'lucide-react'
import { formatPlainRupiah, formatWeightKg } from '@/components/home/offer-card-helpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatShortDateId } from '@/lib/data/profile-helpers'
import { buildTransactionsCsv, summarizeCompletedTransactions } from '@/lib/data/transaction-export'
import type { Order } from '@/types/api/orders'

export function AccountTransactionSummary({
  orders,
  fromDate,
  toDate,
}: {
  orders: Order[]
  fromDate: Date | null
  toDate: Date | null
}) {
  const summary = summarizeCompletedTransactions(orders)

  function download() {
    const createdAt = new Date().toISOString()
    const csv = buildTransactionsCsv(orders, {
      from: fromDate ? formatShortDateId(fromDate) : '',
      to: toDate ? formatShortDateId(toDate) : '',
      createdAt,
    })
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'rekap-transaksi-' + createdAt.slice(0, 10) + '.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <Card className='bg-muted/30'>
      <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <CardTitle className='text-base'>Rekap transaksi selesai</CardTitle>
          <CardDescription>
            Ringkasan Pangan Tersalurkan dari transaksi selesai pada rentang tanggal terpilih.
          </CardDescription>
        </div>
        {summary.count > 0 && (
          <Button variant='outline' size='sm' className='shrink-0 self-start' onClick={download}>
            <Download data-icon='inline-start' aria-hidden='true' />
            <span>Unduh rekap CSV</span>
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <dl className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='flex flex-col gap-0.5 rounded-lg border border-border bg-background p-3'>
            <dt className='text-xs text-muted-foreground'>Pangan Tersalurkan</dt>
            <dd className='text-lg font-bold text-primary tabular-nums'>
              {formatWeightKg(summary.weightKg)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5 rounded-lg border border-border bg-background p-3'>
            <dt className='text-xs text-muted-foreground'>Total belanja</dt>
            <dd className='text-lg font-bold text-foreground tabular-nums'>
              {formatPlainRupiah(summary.totalIdr)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5 rounded-lg border border-border bg-background p-3'>
            <dt className='text-xs text-muted-foreground'>Petani mitra</dt>
            <dd className='text-lg font-bold text-foreground tabular-nums'>
              {summary.farmerCount}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
