import Image from 'next/image'
import { CalendarClock, MapPin, Package } from 'lucide-react'
import {
  formatPlainRupiah,
  formatPricePerKg,
  formatWeightKg,
} from '@/components/home/offer-card-helpers'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { isSafeOfferPhotoUrl } from '@/lib/data/offer-detail-helpers'

interface CheckoutSummarySidebarProps {
  commodityName: string
  farmerName: string
  photoUrl?: string
  quantityKg: number | null
  pricePerKg: number
  totalPrice: number | null
  pickupAreaLabel: string
  pickupFullAddress?: string
  pickupNotes?: string
  scheduleLabel?: string
  orderId?: string
  statusLabel?: string
  statusVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function CheckoutSummarySidebar({
  commodityName,
  farmerName,
  photoUrl,
  quantityKg,
  pricePerKg,
  totalPrice,
  pickupAreaLabel,
  pickupFullAddress,
  pickupNotes,
  scheduleLabel,
  orderId,
  statusLabel,
  statusVariant = 'secondary',
}: CheckoutSummarySidebarProps) {
  const safePhoto = photoUrl ? isSafeOfferPhotoUrl(photoUrl) : null

  return (
    <Card className='h-fit'>
      <CardHeader className='flex flex-row items-center justify-between gap-2'>
        <CardTitle>Ringkasan pesanan</CardTitle>
        {statusLabel && <Badge variant={statusVariant}>{statusLabel}</Badge>}
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        <div className='flex items-start gap-3'>
          <div className='relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted'>
            {safePhoto ? (
              <Image
                src={safePhoto}
                alt={commodityName}
                fill
                sizes='64px'
                className='object-cover'
              />
            ) : (
              <Package className='size-6 text-muted-foreground' aria-hidden='true' />
            )}
          </div>

          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <p className='text-base leading-snug font-semibold text-foreground'>{commodityName}</p>
            <p className='text-sm text-muted-foreground'>{farmerName}</p>
            <p className='text-xs text-muted-foreground'>1 penawaran · Ambil mandiri</p>
          </div>
        </div>

        <Separator />

        <dl className='flex flex-col gap-2.5 text-sm'>
          {orderId && (
            <div className='flex items-baseline justify-between gap-2'>
              <dt className='text-muted-foreground'>ID pesanan</dt>
              <dd className='font-mono font-medium text-foreground'>{orderId}</dd>
            </div>
          )}

          <div className='flex items-baseline justify-between gap-2'>
            <dt className='text-muted-foreground'>Berat pesanan</dt>
            <dd className='font-medium text-foreground tabular-nums'>
              {quantityKg !== null ? formatWeightKg(quantityKg) : '—'}
            </dd>
          </div>

          <div className='flex items-baseline justify-between gap-2'>
            <dt className='text-muted-foreground'>Harga satuan</dt>
            <dd className='font-medium text-foreground tabular-nums'>
              {formatPricePerKg(pricePerKg)}
            </dd>
          </div>

          <div className='flex items-baseline justify-between gap-2'>
            <dt className='text-muted-foreground'>Biaya kirim</dt>
            <dd className='font-medium text-foreground tabular-nums'>Rp 0</dd>
          </div>
        </dl>

        <Separator />

        <div className='flex items-baseline justify-between gap-2'>
          <span className='text-base font-semibold text-foreground'>Total tagihan</span>
          <span className='text-xl font-bold text-primary tabular-nums'>
            {totalPrice !== null ? formatPlainRupiah(totalPrice) : '—'}
          </span>
        </div>

        <Separator />

        <div className='flex flex-col gap-3 text-sm'>
          {scheduleLabel && (
            <div className='flex items-start gap-2.5'>
              <CalendarClock className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
              <div className='flex flex-col gap-0.5'>
                <span className='text-xs font-medium text-muted-foreground'>Jadwal ambil</span>
                <span className='font-medium text-foreground tabular-nums'>{scheduleLabel}</span>
              </div>
            </div>
          )}

          <div className='flex items-start gap-2.5'>
            <MapPin className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
            <div className='flex flex-col gap-0.5'>
              <span className='text-xs font-medium text-muted-foreground'>
                {pickupFullAddress ? 'Alamat lengkap pengambilan' : 'Area pengambilan'}
              </span>
              <span className='font-medium text-foreground'>
                {pickupFullAddress || pickupAreaLabel}
              </span>
              {pickupNotes && <span className='text-xs text-muted-foreground'>{pickupNotes}</span>}
              {!pickupFullAddress && (
                <span className='text-xs text-muted-foreground'>
                  Alamat lengkap terbuka setelah reservasi dibuat.
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
