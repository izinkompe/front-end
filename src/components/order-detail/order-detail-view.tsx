'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  RefreshCw,
  RotateCcw,
  User as UserIcon,
  XCircle,
} from 'lucide-react'
import { OrderComplaints } from '@/components/complaints/order-complaints'
import { CheckoutHeader } from '@/components/checkout/checkout-header'
import { CheckoutSkeleton } from '@/components/checkout/checkout-skeleton'
import { formatWeightKg } from '@/components/home/offer-card-helpers'
import { GlobalFooter } from '@/components/layout/global-footer'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useCancelOrder, useOrderDetail } from '@/hooks/api/use-orders'
import { usePaymentDetail } from '@/hooks/api/use-payments'
import {
  buildOrderTimelineSteps,
  formatOrderStatusLabel,
  getOrderBankAccount,
  isSafeProofImageUrl,
} from '@/lib/data/checkout-helpers'
import { formatDateTimeId } from '@/lib/data/offer-detail-helpers'
import { OrderCommodityCard } from './order-commodity-card'
import { OrderCompletedReceiptCard } from './order-completed-receipt-card'
import { OrderPickupLocationCard } from './order-pickup-location-card'
import { OrderPrintSheet, type OrderPrintMode } from './order-print-sheet'
import { OrderReceiptConfirmationCard } from './order-receipt-confirmation-card'
import { OrderScheduleProposalCard } from './order-schedule-proposal-card'
import { OrderStatusTimeline } from './order-status-timeline'

interface OrderDetailViewProps {
  orderId: string
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const { data: currentUser } = useCurrentUser()
  const { data: order, isPending, isError, refetch } = useOrderDetail(orderId)
  const { data: paymentDetail } = usePaymentDetail(orderId)
  const cancelOrderMutation = useCancelOrder()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [printMode, setPrintMode] = useState<OrderPrintMode | null>(null)
  const printTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (printTimerRef.current) {
        clearTimeout(printTimerRef.current)
      }
    }
  }, [])

  function handleTriggerPrint(mode: OrderPrintMode) {
    if (printTimerRef.current) {
      clearTimeout(printTimerRef.current)
    }
    setPrintMode(mode)
    printTimerRef.current = setTimeout(() => {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print()
      }
      printTimerRef.current = null
    }, 60)
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
        <main className='mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8'>
          <Alert>
            <AlertCircle aria-hidden='true' />
            <AlertTitle>Pesanan tidak ditemukan</AlertTitle>
            <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <span>Pesanan ini tidak tersedia atau sesi lokal telah diperbarui.</span>
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
        </main>
        <GlobalFooter />
      </>
    )
  }

  const timelineSteps = buildOrderTimelineSteps(order)
  const bankInfo = paymentDetail
    ? {
        bankName: paymentDetail.bankName,
        accountNumber: paymentDetail.accountNumber,
        accountHolderName: paymentDetail.accountHolder,
      }
    : getOrderBankAccount(order)

  const statusLabel = formatOrderStatusLabel(order.status, order.rejectionReason)
  const isCancelled = order.status === 'cancelled'
  const isDisputed = order.status === 'disputed'
  const isPendingPayment = order.status === 'pending_payment'
  const isPaymentSubmitted = order.status === 'payment_submitted'
  const isApprovedOrBeyond =
    order.status === 'processing' ||
    order.status === 'ready_for_pickup' ||
    order.status === 'completed'

  const statusVariant = isApprovedOrBeyond
    ? 'default'
    : isCancelled || isDisputed || (isPendingPayment && Boolean(order.rejectionReason))
      ? 'destructive'
      : 'secondary'

  const safeProofUrl = isSafeProofImageUrl(paymentDetail?.proofUrl ?? order.paymentProofUrl)
  const showOrganization = currentUser?.preferences?.showOrganizationOnReceipts ?? true
  const resolvedPrintMode: OrderPrintMode =
    printMode ?? (order.status === 'completed' ? 'receipt' : 'pickup-pass')

  return (
    <>
      <div className='print:hidden'>
        <CheckoutHeader backHref='/pasar' backLabel='Pasar panen' />
      </div>

      <main className='mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:hidden'>
        <div className='grid grid-cols-1 gap-6 rounded-xl border border-border bg-card p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8'>
          <div className='flex flex-col gap-5'>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-wrap items-center gap-3'>
                <Badge variant={statusVariant}>{statusLabel}</Badge>
                <span className='text-sm text-muted-foreground tabular-nums'>
                  {formatDateTimeId(order.updatedAt)}
                </span>
              </div>

              <h1 className='type-h1 text-foreground'>Detail pesanan</h1>
            </div>

            <dl className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-3'>
              <div className='flex flex-col gap-0.5'>
                <dt className='text-xs text-muted-foreground'>No. pesanan</dt>
                <dd className='font-mono font-semibold text-foreground'>{order.id}</dd>
              </div>
              <div className='flex flex-col gap-0.5'>
                <dt className='text-xs text-muted-foreground'>Tanggal pesan</dt>
                <dd className='font-medium text-foreground tabular-nums'>
                  {formatDateTimeId(order.createdAt)}
                </dd>
              </div>
              <div className='flex flex-col gap-0.5'>
                <dt className='text-xs text-muted-foreground'>Metode pengambilan</dt>
                <dd className='font-medium text-foreground'>Ambil mandiri</dd>
              </div>
            </dl>

            {isCancelled && (
              <Alert variant='destructive'>
                <XCircle aria-hidden='true' />
                <AlertTitle>Pesanan dibatalkan</AlertTitle>
                <AlertDescription className='flex flex-col gap-3'>
                  <span>
                    Stok sebesar {formatWeightKg(order.quantityKg)} telah dikembalikan ke penawaran
                    petani. Anda dapat memesan ulang kapan saja selama penawaran masih aktif.
                  </span>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      size='sm'
                      nativeButton={false}
                      render={<Link href={`/pasar/penawaran/${order.offerId}`} />}
                    >
                      <RotateCcw data-icon='inline-start' aria-hidden='true' />
                      Pesan ulang komoditas
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      nativeButton={false}
                      render={<Link href='/pasar' />}
                    >
                      Cari penawaran lain
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {isPendingPayment && (
              <Alert>
                <Clock aria-hidden='true' />
                <AlertTitle>
                  {order.rejectionReason
                    ? 'Bukti transfer ditolak, unggah ulang sebelum tenggat'
                    : 'Menunggu pembayaran transfer manual'}
                </AlertTitle>
                <AlertDescription className='flex flex-col gap-3'>
                  <span>
                    {order.rejectionReason
                      ? `Alasan: ${order.rejectionReason}. Batas bayar hingga ${formatDateTimeId(order.paymentDeadline)}.`
                      : `Selesaikan transfer dan unggah bukti sebelum ${formatDateTimeId(order.paymentDeadline)}.`}
                  </span>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      size='sm'
                      nativeButton={false}
                      render={<Link href={`/pesanan/${order.id}/bayar`} />}
                    >
                      Lanjut bayar
                    </Button>

                    <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                      <AlertDialogTrigger
                        render={
                          <Button
                            type='button'
                            variant='outline'
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
                            penawaran petani dan pesanan ini ditandai dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        {cancelOrderMutation.isError && (
                          <Alert variant='destructive'>
                            <AlertDescription>{cancelOrderMutation.error.message}</AlertDescription>
                          </Alert>
                        )}
                        <AlertDialogFooter>
                          <AlertDialogCancel>Tetap lanjut</AlertDialogCancel>
                          <AlertDialogAction
                            variant='destructive'
                            disabled={cancelOrderMutation.isPending}
                            onClick={() =>
                              cancelOrderMutation.mutate(order.id, {
                                onSuccess: () => setCancelDialogOpen(false),
                              })
                            }
                          >
                            {cancelOrderMutation.isPending && <Spinner data-icon='inline-start' />}
                            <span>Ya, batalkan</span>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {isPaymentSubmitted && (
              <Alert>
                <CheckCircle2 aria-hidden='true' />
                <AlertTitle>Bukti transfer sedang diverifikasi</AlertTitle>
                <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <span>
                    Administrator sedang memeriksa kesesuaian bukti transfer Anda. Status pesanan
                    akan diperbarui otomatis.
                  </span>
                  <Button type='button' variant='outline' size='sm' onClick={() => refetch()}>
                    <RefreshCw data-icon='inline-start' aria-hidden='true' />
                    Periksa status
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isApprovedOrBeyond && (
              <Alert>
                <CheckCircle2 aria-hidden='true' />
                <AlertTitle>{statusLabel}</AlertTitle>
                <AlertDescription>
                  {order.status === 'completed'
                    ? `Penerimaan panen selesai dicatat sebesar ${formatWeightKg(order.confirmedWeightKg ?? order.quantityKg)}.`
                    : `Tunjukkan kartu pengambilan atau nomor pesanan ${order.id} di lokasi petani sesuai jadwal.`}
                </AlertDescription>
              </Alert>
            )}

            {isDisputed && (
              <Alert variant='destructive'>
                <AlertCircle aria-hidden='true' />
                <AlertTitle>Pesanan dalam peninjauan</AlertTitle>
                <AlertDescription>
                  {typeof order.confirmedWeightKg === 'number'
                    ? `Berat aktual tercatat ${formatWeightKg(order.confirmedWeightKg)} dari ${formatWeightKg(order.quantityKg)} dipesan. `
                    : ''}
                  {order.weightDiscrepancyNote ||
                    'Lihat status laporan di bagian pengaduan pesanan.'}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className='border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6'>
            <OrderStatusTimeline steps={timelineSteps} />
          </div>
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10'>
          <div className='flex flex-col gap-6'>
            <OrderScheduleProposalCard key={`schedule-${order.id}`} order={order} />

            <OrderReceiptConfirmationCard key={`receipt-${order.id}`} order={order} />

            <OrderCompletedReceiptCard
              order={order}
              showOrganization={showOrganization}
              onPrintReceipt={() => handleTriggerPrint('receipt')}
            />

            <OrderPickupLocationCard
              order={order}
              showPickupActions={isApprovedOrBeyond || isDisputed}
              showOrganization={showOrganization}
              onPrintPickupPass={() => handleTriggerPrint('pickup-pass')}
            />

            <Card>
              <CardHeader>
                <CardTitle>Alamat dan kontak pembeli</CardTitle>
                <CardDescription>
                  Data penanggung jawab pengambilan dan alamat akun.
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col gap-3 text-sm'>
                {(order.buyerContactName || order.buyerOrganization) && (
                  <div className='flex items-start gap-2.5'>
                    <UserIcon
                      className='mt-0.5 size-4 shrink-0 text-muted-foreground'
                      aria-hidden='true'
                    />
                    <div className='flex flex-col gap-0.5'>
                      <span className='font-semibold text-foreground'>
                        {order.buyerContactName || 'Pembeli PanganTani'}
                      </span>
                      {order.buyerOrganization && (
                        <span className='text-muted-foreground'>{order.buyerOrganization}</span>
                      )}
                    </div>
                  </div>
                )}

                {order.buyerContactPhone && (
                  <div className='flex items-center gap-2.5'>
                    <Phone className='size-4 shrink-0 text-muted-foreground' aria-hidden='true' />
                    <span className='text-foreground tabular-nums'>{order.buyerContactPhone}</span>
                  </div>
                )}

                <Separator />

                <div className='flex items-start gap-2.5'>
                  <MapPin
                    className='mt-0.5 size-4 shrink-0 text-muted-foreground'
                    aria-hidden='true'
                  />
                  {order.buyerAddress ? (
                    <div className='flex flex-col gap-0.5'>
                      <span className='font-medium text-foreground'>
                        {order.buyerAddress.label}
                      </span>
                      <span className='text-foreground'>{order.buyerAddress.fullAddress}</span>
                      <span className='text-xs text-muted-foreground'>
                        {order.buyerAddress.areaName}
                      </span>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>Alamat pembeli belum dicantumkan.</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col gap-4 text-sm'>
                <div className='flex items-start gap-2.5'>
                  <CreditCard
                    className='mt-0.5 size-4 shrink-0 text-muted-foreground'
                    aria-hidden='true'
                  />
                  <div className='flex flex-col gap-0.5'>
                    <span className='font-semibold text-foreground'>
                      Transfer Bank Manual ({bankInfo.bankName})
                    </span>
                    <span className='font-mono text-foreground tabular-nums'>
                      {bankInfo.accountNumber} · {bankInfo.accountHolderName}
                    </span>
                  </div>
                </div>

                {order.paymentSubmittedAt && (
                  <p className='text-xs text-muted-foreground tabular-nums'>
                    Bukti dikirim pada {formatDateTimeId(order.paymentSubmittedAt)}
                  </p>
                )}

                {order.paymentNotes && (
                  <p className='rounded-lg bg-muted/40 px-3 py-2 text-foreground'>
                    Catatan: {order.paymentNotes}
                  </p>
                )}

                {safeProofUrl && (
                  <div className='overflow-hidden rounded-lg border border-border bg-muted/20 p-2'>
                    <Image
                      src={safeProofUrl}
                      alt='Bukti transfer pesanan'
                      width={640}
                      height={360}
                      unoptimized
                      className='max-h-64 w-full object-contain'
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className='flex flex-col gap-6'>
            <OrderCommodityCard order={order} />
            <OrderComplaints order={order} />
          </div>
        </div>
      </main>

      <OrderPrintSheet order={order} mode={resolvedPrintMode} showOrganization={showOrganization} />

      <div className='print:hidden'>
        <GlobalFooter />
      </div>
    </>
  )
}
