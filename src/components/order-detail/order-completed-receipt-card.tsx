'use client'

import { CheckCircle2, Printer } from 'lucide-react'
import {
  formatPlainRupiah,
  formatPricePerKg,
  formatWeightKg,
} from '@/components/home/offer-card-helpers'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getOrderBankAccount } from '@/lib/data/checkout-helpers'
import { formatDateTimeId, formatPickupSlotLabel } from '@/lib/data/offer-detail-helpers'
import type { Order } from '@/types/api/orders'

interface OrderCompletedReceiptCardProps {
  order: Order
  showOrganization: boolean
  onPrintReceipt: () => void
}

export function OrderCompletedReceiptCard({
  order,
  showOrganization,
  onPrintReceipt,
}: OrderCompletedReceiptCardProps) {
  if (order.status !== 'completed') {
    return null
  }

  const confirmedKg = order.confirmedWeightKg ?? order.quantityKg
  const bankInfo = getOrderBankAccount(order)

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <CheckCircle2 className='size-5 text-primary' aria-hidden='true' />
          <CardTitle>Bukti transaksi selesai</CardTitle>
        </div>
        <CardDescription>
          Catatan Pangan Tersalurkan resmi untuk pembukuan organisasi Anda.
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-4 text-sm'>
        <dl className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-xs text-muted-foreground'>Nomor nota</dt>
            <dd className='font-mono font-semibold text-foreground'>{order.id}</dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-xs text-muted-foreground'>Waktu diterima</dt>
            <dd className='font-medium text-foreground tabular-nums'>
              {formatDateTimeId(order.receiptConfirmedAt ?? order.updatedAt)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-xs text-muted-foreground'>Pembeli</dt>
            <dd className='font-medium text-foreground'>
              {showOrganization && order.buyerOrganization
                ? `${order.buyerOrganization} (${order.buyerContactName || 'Pembeli'})`
                : order.buyerContactName || 'Pembeli PanganTani'}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-xs text-muted-foreground'>Petani penyedia</dt>
            <dd className='font-medium text-foreground'>
              {order.farmerName || 'Petani mitra PanganTani'}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-xs text-muted-foreground'>Berat dipesan</dt>
            <dd className='font-medium text-foreground tabular-nums'>
              {formatWeightKg(order.quantityKg)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-xs text-muted-foreground'>Berat aktual (Pangan Tersalurkan)</dt>
            <dd className='font-semibold text-primary tabular-nums'>
              {formatWeightKg(confirmedKg)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-xs text-muted-foreground'>Harga satuan</dt>
            <dd className='font-medium text-foreground tabular-nums'>
              {formatPricePerKg(order.pricePerKg)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-xs text-muted-foreground'>Metode transfer</dt>
            <dd className='font-medium text-foreground'>
              {bankInfo.bankName} ({bankInfo.accountNumber})
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-xs text-muted-foreground'>Jadwal pengambilan</dt>
            <dd className='text-foreground tabular-nums'>
              {formatPickupSlotLabel(order.scheduleSlot)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5 sm:col-span-2'>
            <dt className='text-xs text-muted-foreground'>Lokasi pengambilan</dt>
            <dd className='text-foreground'>{order.pickupLocation.address}</dd>
          </div>
        </dl>

        <Separator />

        <div className='flex items-baseline justify-between gap-2'>
          <span className='font-medium text-muted-foreground'>Total pembayaran</span>
          <span className='text-lg font-bold text-foreground tabular-nums'>
            {formatPlainRupiah(order.totalPrice)}
          </span>
        </div>
      </CardContent>

      <CardFooter className='justify-end'>
        <Button type='button' variant='outline' size='sm' onClick={onPrintReceipt}>
          <Printer data-icon='inline-start' aria-hidden='true' />
          <span>Cetak atau simpan bukti</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
