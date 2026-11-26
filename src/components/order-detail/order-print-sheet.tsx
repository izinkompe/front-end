import {
  formatPlainRupiah,
  formatPricePerKg,
  formatWeightKg,
} from '@/components/home/offer-card-helpers'
import { formatOrderStatusLabel, getOrderBankAccount } from '@/lib/data/checkout-helpers'
import { formatDateTimeId, formatPickupSlotLabel } from '@/lib/data/offer-detail-helpers'
import type { Order } from '@/types/api/orders'

export type OrderPrintMode = 'pickup-pass' | 'receipt'

interface OrderPrintSheetProps {
  order: Order
  mode: OrderPrintMode
  showOrganization: boolean
}

export function OrderPrintSheet({ order, mode, showOrganization }: OrderPrintSheetProps) {
  const bankInfo = getOrderBankAccount(order)
  const confirmedKg = order.confirmedWeightKg ?? order.quantityKg
  const buyerLabel =
    showOrganization && order.buyerOrganization
      ? `${order.buyerOrganization} (${order.buyerContactName || 'Pembeli'})`
      : order.buyerContactName || 'Pembeli PanganTani'

  return (
    <section
      aria-hidden='true'
      className='hidden print:block print:bg-white print:p-8 print:text-black'
    >
      <div className='mx-auto flex max-w-2xl flex-col gap-5 rounded-lg border border-neutral-300 p-6'>
        <div className='flex items-start justify-between gap-4 border-b border-neutral-300 pb-4'>
          <div className='flex flex-col gap-1'>
            <p className='text-sm font-semibold'>PanganTani</p>
            <h1 className='text-xl font-bold'>
              {mode === 'receipt' ? 'Bukti Transaksi Selesai' : 'Kartu Pengambilan Panen'}
            </h1>
          </div>
          <div className='text-right text-xs'>
            <p className='font-mono font-semibold'>{order.id}</p>
            <p>{formatOrderStatusLabel(order.status, order.rejectionReason)}</p>
          </div>
        </div>

        <dl className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <dt className='text-xs text-neutral-600'>Komoditas</dt>
            <dd className='font-semibold'>{order.commodityName}</dd>
          </div>
          <div>
            <dt className='text-xs text-neutral-600'>Petani penyedia</dt>
            <dd className='font-medium'>{order.farmerName || 'Petani mitra PanganTani'}</dd>
          </div>
          <div>
            <dt className='text-xs text-neutral-600'>Berat dipesan</dt>
            <dd className='font-semibold tabular-nums'>{formatWeightKg(order.quantityKg)}</dd>
          </div>
          {mode === 'receipt' ? (
            <div>
              <dt className='text-xs text-neutral-600'>Berat aktual (Pangan Tersalurkan)</dt>
              <dd className='font-semibold tabular-nums'>{formatWeightKg(confirmedKg)}</dd>
            </div>
          ) : (
            <div>
              <dt className='text-xs text-neutral-600'>Jadwal ambil</dt>
              <dd className='font-semibold tabular-nums'>
                {formatPickupSlotLabel(order.scheduleSlot)}
              </dd>
            </div>
          )}
          <div className='col-span-2'>
            <dt className='text-xs text-neutral-600'>Lokasi pengambilan mandiri</dt>
            <dd className='font-medium'>{order.pickupLocation.address}</dd>
            {order.pickupLocation.notes && (
              <dd className='text-xs text-neutral-700'>Patokan: {order.pickupLocation.notes}</dd>
            )}
          </div>
          <div>
            <dt className='text-xs text-neutral-600'>Penanggung jawab pembeli</dt>
            <dd className='font-medium'>{buyerLabel}</dd>
            {order.buyerContactPhone && (
              <dd className='text-xs tabular-nums'>{order.buyerContactPhone}</dd>
            )}
          </div>
          <div>
            <dt className='text-xs text-neutral-600'>
              {mode === 'receipt' ? 'Waktu selesai' : 'Tanggal pesan'}
            </dt>
            <dd className='tabular-nums'>
              {formatDateTimeId(
                mode === 'receipt' ? (order.receiptConfirmedAt ?? order.updatedAt) : order.createdAt
              )}
            </dd>
          </div>
          <div>
            <dt className='text-xs text-neutral-600'>Harga satuan</dt>
            <dd className='tabular-nums'>{formatPricePerKg(order.pricePerKg)}</dd>
          </div>
          <div>
            <dt className='text-xs text-neutral-600'>Transfer manual</dt>
            <dd>
              {bankInfo.bankName} ({bankInfo.accountNumber})
            </dd>
          </div>
        </dl>

        <div className='flex items-center justify-between border-t border-neutral-300 pt-4 text-base font-bold'>
          <span>Total transaksi</span>
          <span className='tabular-nums'>{formatPlainRupiah(order.totalPrice)}</span>
        </div>
      </div>
    </section>
  )
}
