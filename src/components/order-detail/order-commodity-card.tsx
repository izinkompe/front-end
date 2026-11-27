import Image from 'next/image'
import Link from 'next/link'
import { Package } from 'lucide-react'
import {
  formatPlainRupiah,
  formatPricePerKg,
  formatWeightKg,
} from '@/components/home/offer-card-helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isSafeOfferPhotoUrl } from '@/lib/data/offer-detail-helpers'
import type { Order } from '@/types/api/orders'

interface OrderCommodityCardProps {
  order: Pick<
    Order,
    | 'offerId'
    | 'commodityName'
    | 'commodityPhotoUrl'
    | 'farmerName'
    | 'quantityKg'
    | 'confirmedWeightKg'
    | 'pricePerKg'
    | 'totalPrice'
  >
}

export function OrderCommodityCard({ order }: OrderCommodityCardProps) {
  const safeCommodityPhoto = order.commodityPhotoUrl
    ? isSafeOfferPhotoUrl(order.commodityPhotoUrl)
    : null

  return (
    <Card className='h-fit'>
      <CardHeader>
        <CardTitle>Detail komoditas</CardTitle>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        <div className='flex items-start gap-4'>
          <div className='relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted'>
            {safeCommodityPhoto ? (
              <Image
                src={safeCommodityPhoto}
                alt={order.commodityName}
                fill
                sizes='80px'
                loading='eager'
                fetchPriority='high'
                className='object-cover'
              />
            ) : (
              <Package className='size-7 text-muted-foreground' aria-hidden='true' />
            )}
          </div>

          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <Link
              href={`/pasar/penawaran/${order.offerId}`}
              className='text-base font-semibold text-foreground underline-offset-4 hover:underline'
            >
              {order.commodityName}
            </Link>
            <p className='text-sm text-muted-foreground'>
              {order.farmerName || 'Petani mitra PanganTani'}
            </p>
            <p className='text-sm text-foreground tabular-nums'>
              {formatWeightKg(order.quantityKg)} × {formatPricePerKg(order.pricePerKg)}
            </p>
          </div>
        </div>

        <dl className='flex flex-col gap-2.5 pt-1 text-sm'>
          <div className='flex items-baseline justify-between gap-2'>
            <dt className='text-muted-foreground'>Subtotal komoditas</dt>
            <dd className='font-medium text-foreground tabular-nums'>
              {formatPlainRupiah(order.totalPrice)}
            </dd>
          </div>

          {typeof order.confirmedWeightKg === 'number' && (
            <div className='flex items-baseline justify-between gap-2'>
              <dt className='text-muted-foreground'>Berat aktual diterima</dt>
              <dd className='font-medium text-foreground tabular-nums'>
                {formatWeightKg(order.confirmedWeightKg)}
              </dd>
            </div>
          )}

          <div className='flex items-baseline justify-between gap-2'>
            <dt className='text-muted-foreground'>Biaya pengambilan mandiri</dt>
            <dd className='font-medium text-foreground tabular-nums'>Rp 0</dd>
          </div>
        </dl>

        <div className='flex items-baseline justify-between gap-2 pt-2'>
          <span className='text-base font-semibold text-foreground'>Total</span>
          <span className='text-xl font-bold text-primary tabular-nums'>
            {formatPlainRupiah(order.totalPrice)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
