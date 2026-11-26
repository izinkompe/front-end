'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, Check, Clock, Copy, RefreshCw, ShieldAlert, XCircle } from 'lucide-react'
import { formatPlainRupiah, formatWeightKg } from '@/components/home/offer-card-helpers'
import { OrderDetailView } from '@/components/order-detail/order-detail-view'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useCancelOrder, useOrderDetail } from '@/hooks/api/use-orders'
import { usePaymentDetail } from '@/hooks/api/use-payments'
import {
  formatOrderStatusLabel,
  getOrderBankAccount,
  getPaymentCountdownState,
} from '@/lib/data/checkout-helpers'
import { formatDateTimeId, formatPickupSlotLabel } from '@/lib/data/offer-detail-helpers'
import { cn } from '@/lib/utils'
import { CheckoutHeader } from './checkout-header'
import { CheckoutProgress } from './checkout-progress'
import { CheckoutSkeleton } from './checkout-skeleton'
import { CheckoutSummarySidebar } from './checkout-summary-sidebar'
import { PaymentProofUpload } from './payment-proof-upload'

interface OrderPaymentViewProps {
  orderId: string
}

export function OrderPaymentView({ orderId }: OrderPaymentViewProps) {
  const router = useRouter()
  const { data: order, isPending, isError, refetch } = useOrderDetail(orderId)
  const { data: paymentDetail } = usePaymentDetail(orderId)
  const cancelOrderMutation = useCancelOrder()

  const [nowMs, setNowMs] = useState<number>(() => Date.now())
  const [copiedField, setCopiedField] = useState<'account' | 'amount' | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNowMs(Date.now())
    }, 1000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!copiedField) return
    const timer = setTimeout(() => setCopiedField(null), 2000)
    return () => clearTimeout(timer)
  }, [copiedField])

  useEffect(() => {
    if (order && order.status !== 'pending_payment') {
      router.replace(`/pesanan/${orderId}`)
    }
  }, [order, orderId, router])

  async function handleCopy(field: 'account' | 'amount', value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
    } catch {
      setCopiedField(null)
    }
  }

  async function handleCancelOrder() {
    await cancelOrderMutation.mutateAsync(orderId)
    setCancelDialogOpen(false)
    router.push(`/pesanan/${orderId}`)
  }

  if (isPending) {
    return (
      <>
        <CheckoutHeader backHref='/pasar' backLabel='Kembali ke pasar' />
        <CheckoutSkeleton />
      </>
    )
  }

  if (isError || !order) {
    return (
      <>
        <CheckoutHeader backHref='/pasar' backLabel='Kembali ke pasar' />
        <div className='mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8'>
          <Alert>
            <AlertCircle aria-hidden='true' />
            <AlertTitle>Pesanan tidak ditemukan</AlertTitle>
            <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <span>Pesanan ini tidak tersedia atau telah dihapus dari sesi lokal.</span>
              <div className='flex flex-wrap gap-2'>
                <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
                  <RefreshCw data-icon='inline-start' aria-hidden='true' />
                  Muat ulang
                </Button>
                <Button size='sm' nativeButton={false} render={<Link href='/pasar' />}>
                  Kembali ke katalog
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  if (order.status !== 'pending_payment') {
    return <OrderDetailView orderId={order.id} />
  }

  const countdown = getPaymentCountdownState(order.paymentDeadline, nowMs)
  const bankInfo = paymentDetail
    ? {
        bankName: paymentDetail.bankName,
        accountNumber: paymentDetail.accountNumber,
        accountHolderName: paymentDetail.accountHolder,
      }
    : getOrderBankAccount(order)

  const isRejectedReupload = Boolean(order.rejectionReason)
  const isExpiredUnpaid = countdown.isExpired
  const statusLabel = formatOrderStatusLabel(order.status, order.rejectionReason)
  const statusVariant = isExpiredUnpaid || isRejectedReupload ? 'destructive' : 'secondary'

  const backHref = `/pasar/penawaran/${order.offerId}`

  return (
    <>
      <CheckoutHeader backHref={backHref} backLabel='Detail penawaran' />

      <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
        <div className='flex flex-col gap-3'>
          <h1 className='type-h1 text-foreground'>Pembayaran pesanan</h1>
          <CheckoutProgress currentStep={2} />
        </div>

        <p role='status' aria-live='polite' className='sr-only'>
          {copiedField === 'account'
            ? 'Nomor rekening disalin ke papan klip.'
            : copiedField === 'amount'
              ? 'Nominal tagihan disalin ke papan klip.'
              : ''}
        </p>

        <div className='offer-sticky-parent grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px]'>
          <div className='flex flex-col gap-6'>
            {!isExpiredUnpaid && (
              <Alert
                className={cn(
                  countdown.isUrgent && 'border-destructive/40 bg-destructive/5 text-foreground'
                )}
              >
                <Clock aria-hidden='true' />
                <AlertTitle>
                  Batas unggah bukti transfer:{' '}
                  <span className='tabular-nums'>{countdown.label}</span>
                </AlertTitle>
                <AlertDescription>
                  Selesaikan transfer sebelum {formatDateTimeId(order.paymentDeadline)}. Stok
                  dilepas otomatis bila bukti tidak dikirim hingga batas waktu berakhir.
                </AlertDescription>
              </Alert>
            )}

            {isRejectedReupload && (
              <Alert variant='destructive'>
                <ShieldAlert aria-hidden='true' />
                <AlertTitle>Bukti transfer perlu diperbaiki</AlertTitle>
                <AlertDescription>
                  Alasan penolakan: {order.rejectionReason}. Unggah ulang foto bukti yang sesuai
                  sebelum tenggat berakhir.
                </AlertDescription>
              </Alert>
            )}

            {isExpiredUnpaid ? (
              <Alert variant='destructive'>
                <XCircle aria-hidden='true' />
                <AlertTitle>Tenggat pembayaran berakhir</AlertTitle>
                <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <span>
                    Waktu unggah bukti transfer telah habis sehingga reservasi stok dilepas.
                  </span>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      nativeButton={false}
                      render={<Link href={`/pesanan/${order.id}`} />}
                    >
                      Lihat detail pesanan
                    </Button>
                    <Button size='sm' nativeButton={false} render={<Link href='/pasar' />}>
                      Cari penawaran lain
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Instruksi transfer bank</CardTitle>
                    <CardDescription>
                      Transfer tepat sesuai nominal tagihan agar verifikasi berjalan cepat.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className='flex flex-col gap-4'>
                    <dl className='flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4'>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <dt className='text-sm text-muted-foreground'>Bank tujuan</dt>
                        <dd className='text-base font-semibold text-foreground'>
                          {bankInfo.bankName}
                        </dd>
                      </div>

                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <dt className='text-sm text-muted-foreground'>Atas nama</dt>
                        <dd className='text-base font-medium text-foreground'>
                          {bankInfo.accountHolderName}
                        </dd>
                      </div>

                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <dt className='text-sm text-muted-foreground'>Nomor rekening</dt>
                        <dd className='flex items-center gap-2'>
                          <span className='font-mono text-base font-semibold text-foreground tabular-nums'>
                            {bankInfo.accountNumber}
                          </span>
                          <Button
                            type='button'
                            variant='outline'
                            size='xs'
                            onClick={() => handleCopy('account', bankInfo.accountNumber)}
                          >
                            {copiedField === 'account' ? (
                              <Check data-icon='inline-start' aria-hidden='true' />
                            ) : (
                              <Copy data-icon='inline-start' aria-hidden='true' />
                            )}
                            <span>{copiedField === 'account' ? 'Tersalin' : 'Salin'}</span>
                          </Button>
                        </dd>
                      </div>

                      <div className='flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3'>
                        <dt className='text-sm font-medium text-foreground'>Total transfer</dt>
                        <dd className='flex items-center gap-2'>
                          <span className='text-lg font-bold text-primary tabular-nums'>
                            {formatPlainRupiah(order.totalPrice)}
                          </span>
                          <Button
                            type='button'
                            variant='outline'
                            size='xs'
                            onClick={() => handleCopy('amount', String(order.totalPrice))}
                          >
                            {copiedField === 'amount' ? (
                              <Check data-icon='inline-start' aria-hidden='true' />
                            ) : (
                              <Copy data-icon='inline-start' aria-hidden='true' />
                            )}
                            <span>{copiedField === 'amount' ? 'Tersalin' : 'Salin nominal'}</span>
                          </Button>
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <PaymentProofUpload
                  orderId={order.id}
                  isReupload={isRejectedReupload}
                  disabled={isExpiredUnpaid}
                  existingProofUrl={order.paymentProofUrl}
                  onSubmitted={() => router.push(`/pesanan/${order.id}`)}
                />

                <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4'>
                  <p className='text-sm text-muted-foreground'>
                    Ingin mengubah berat atau membatalkan reservasi ini?
                  </p>

                  <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <AlertDialogTrigger
                      render={
                        <Button
                          type='button'
                          variant='destructive'
                          size='sm'
                          disabled={cancelOrderMutation.isPending}
                        />
                      }
                    >
                      Batalkan pesanan
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Batalkan reservasi pesanan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Stok sebesar {formatWeightKg(order.quantityKg)} akan dilepas kembali ke
                          penawaran petani dan Anda akan diarahkan ke rincian pesanan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Tetap lanjut bayar</AlertDialogCancel>
                        <AlertDialogAction
                          variant='destructive'
                          disabled={cancelOrderMutation.isPending}
                          onClick={handleCancelOrder}
                        >
                          {cancelOrderMutation.isPending && <Spinner data-icon='inline-start' />}
                          <span>Ya, batalkan pesanan</span>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>

          <aside aria-label='Ringkasan pesanan' className='lg:sticky lg:top-24 lg:self-start'>
            <CheckoutSummarySidebar
              commodityName={order.commodityName}
              farmerName={order.farmerName || 'Petani mitra PanganTani'}
              photoUrl={order.commodityPhotoUrl}
              quantityKg={order.quantityKg}
              pricePerKg={order.pricePerKg}
              totalPrice={order.totalPrice}
              pickupAreaLabel={order.pickupLocation.address}
              pickupFullAddress={order.pickupLocation.address}
              pickupNotes={order.pickupLocation.notes}
              scheduleLabel={formatPickupSlotLabel(order.scheduleSlot)}
              orderId={order.id}
              statusLabel={statusLabel}
              statusVariant={statusVariant}
            />
          </aside>
        </div>
      </div>
    </>
  )
}
