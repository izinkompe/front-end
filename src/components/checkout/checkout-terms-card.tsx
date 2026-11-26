import { CheckCircle2, Clock, ShieldCheck, Truck } from 'lucide-react'
import { formatPlainRupiah } from '@/components/home/offer-card-helpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface CheckoutTermsCardProps {
  estimatedTotal: number | null
  isDisabled: boolean
  isPending: boolean
  isLoggedIn: boolean
}

export function CheckoutTermsCard({
  estimatedTotal,
  isDisabled,
  isPending,
  isLoggedIn,
}: CheckoutTermsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ketentuan reservasi</CardTitle>
      </CardHeader>

      <CardContent className='flex flex-col gap-5'>
        <ul className='flex flex-col gap-2.5 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2.5'>
            <Truck className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
            <span>Pengambilan dilakukan mandiri di lokasi petani tanpa biaya kirim.</span>
          </li>
          <li className='flex items-start gap-2.5'>
            <Clock className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
            <span>
              Stok dikunci selama 30 menit untuk menyelesaikan transfer manual dan unggah bukti.
            </span>
          </li>
          <li className='flex items-start gap-2.5'>
            <ShieldCheck className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
            <span>
              Alamat lengkap pengambilan terbuka setelah reservasi dibuat. Pembatalan dapat
              dilakukan sebelum batas bayar berakhir.
            </span>
          </li>
        </ul>

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-0.5'>
            <span className='text-xs text-muted-foreground'>Total estimasi tagihan</span>
            <span className='text-xl font-bold text-foreground tabular-nums'>
              {estimatedTotal !== null ? formatPlainRupiah(estimatedTotal) : '—'}
            </span>
          </div>

          <Button
            type='submit'
            size='lg'
            disabled={isDisabled || isPending}
            className='w-full sm:w-auto'
          >
            {isPending ? (
              <Spinner data-icon='inline-start' />
            ) : (
              <CheckCircle2 data-icon='inline-start' aria-hidden='true' />
            )}
            <span>
              {isPending
                ? 'Membuat reservasi...'
                : isLoggedIn
                  ? 'Buat reservasi dan bayar'
                  : 'Masuk untuk buat reservasi'}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
