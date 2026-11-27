'use client'

import { useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, CheckCircle2, Scale } from 'lucide-react'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { formatPlainRupiah, formatWeightKg } from '@/components/home/offer-card-helpers'
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
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useConfirmReceipt } from '@/hooks/api/use-orders'
import { parseWeightInputKg } from '@/lib/data/offer-detail-helpers'
import { analyzeWeightDiscrepancy, validateActualWeightKg } from '@/lib/data/order-pickup-helpers'
import type { Order } from '@/types/api/orders'

interface OrderReceiptConfirmationCardProps {
  order: Order
}

export function OrderReceiptConfirmationCard({ order }: OrderReceiptConfirmationCardProps) {
  const confirmReceiptMutation = useConfirmReceipt()
  const weightInputRef = useRef<HTMLInputElement | null>(null)
  const noteInputRef = useRef<HTMLTextAreaElement | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      weightText: String(order.quantityKg),
      note: '',
    },
    onSubmit: async ({ value }) => {
      const parsedWeightKg = parseWeightInputKg(value.weightText)
      const weightError = validateActualWeightKg(parsedWeightKg)
      if (weightError || parsedWeightKg === null) {
        weightInputRef.current?.focus()
        return
      }

      const discrepancy = analyzeWeightDiscrepancy(
        order.quantityKg,
        parsedWeightKg,
        order.pricePerKg
      )
      if (discrepancy?.isShortage && value.note.trim().length < 5) {
        noteInputRef.current?.focus()
        return
      }

      setConfirmOpen(true)
    },
  })

  if (order.status !== 'ready_for_pickup') {
    return null
  }

  function handleConfirmSubmit() {
    const parsedWeightKg = parseWeightInputKg(form.state.values.weightText)
    const weightError = validateActualWeightKg(parsedWeightKg)
    if (parsedWeightKg === null || weightError) return

    const discrepancy = analyzeWeightDiscrepancy(order.quantityKg, parsedWeightKg, order.pricePerKg)
    if (discrepancy?.isShortage && form.state.values.note.trim().length < 5) return

    confirmReceiptMutation.mutate(
      {
        orderId: order.id,
        confirmedWeightKg: parsedWeightKg,
        note: form.state.values.note.trim() || undefined,
      },
      { onSuccess: () => setConfirmOpen(false) }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konfirmasi penerimaan panen</CardTitle>
        <CardDescription>
          Timbang hasil panen bersama petani lalu catat berat aktual yang Anda terima.
        </CardDescription>
      </CardHeader>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <CardContent className='flex flex-col gap-4'>
          {confirmReceiptMutation.isError && !confirmOpen && (
            <Alert variant='destructive'>
              <AlertCircle aria-hidden='true' />
              <AlertDescription>{confirmReceiptMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <form.Field
              name='weightText'
              validators={{
                onChange: ({ value }) =>
                  validateActualWeightKg(parseWeightInputKg(value)) ?? undefined,
              }}
            >
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                const weightDescribedBy = isInvalid
                  ? 'receipt-actual-weight-hint receipt-actual-weight-error'
                  : 'receipt-actual-weight-hint'
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor='receipt-actual-weight'>
                      Berat aktual diterima (kg)
                    </FieldLabel>
                    <FieldDescription id='receipt-actual-weight-hint'>
                      Pesanan Anda sebesar {formatWeightKg(order.quantityKg)}. Ketelitian hingga
                      0,001 kg.
                    </FieldDescription>

                    <InputGroup>
                      <InputGroupInput
                        ref={weightInputRef}
                        id='receipt-actual-weight'
                        name={field.name}
                        type='text'
                        inputMode='decimal'
                        placeholder='Contoh: 15'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={isInvalid ? 'true' : 'false'}
                        aria-describedby={weightDescribedBy}
                      />
                      <InputGroupAddon align='inline-end'>
                        <InputGroupText>kg</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>

                    <div className='flex flex-wrap items-center gap-2 pt-1'>
                      <Button
                        type='button'
                        variant='outline'
                        size='xs'
                        onClick={() => field.handleChange(String(order.quantityKg))}
                      >
                        Sesuai pesanan ({formatWeightKg(order.quantityKg)})
                      </Button>
                    </div>

                    {isInvalid && <FieldError id='receipt-actual-weight-error' errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.weightText}>
              {(weightText) => {
                const parsedWeightKg = parseWeightInputKg(weightText)
                const weightError = validateActualWeightKg(parsedWeightKg)
                const discrepancy =
                  parsedWeightKg !== null && !weightError
                    ? analyzeWeightDiscrepancy(order.quantityKg, parsedWeightKg, order.pricePerKg)
                    : null

                return (
                  <>
                    {discrepancy?.isShortage && (
                      <Alert variant='destructive'>
                        <AlertCircle aria-hidden='true' />
                        <AlertTitle>
                          Selisih berat kurang {formatWeightKg(discrepancy.absDifferenceKg)}
                        </AlertTitle>
                        <AlertDescription>
                          Nilai selisih sekitar{' '}
                          {formatPlainRupiah(discrepancy.estimatedShortageRefund)}. Pesanan akan
                          ditandai dalam peninjauan untuk penanganan dan pengembalian selisih dana.
                        </AlertDescription>
                      </Alert>
                    )}

                    {discrepancy?.isSurplus && (
                      <Alert>
                        <Scale aria-hidden='true' />
                        <AlertTitle>
                          Berat diterima lebih {formatWeightKg(discrepancy.absDifferenceKg)}
                        </AlertTitle>
                        <AlertDescription>
                          Kelebihan berat dicatat sebagai Pangan Tersalurkan tanpa biaya tambahan
                          dan pesanan langsung selesai.
                        </AlertDescription>
                      </Alert>
                    )}

                    <form.Field
                      name='note'
                      validators={{
                        onChange: ({ value }) =>
                          discrepancy?.isShortage && value.trim().length < 5
                            ? 'Tuliskan catatan selisih berat minimal 5 karakter sebagai bukti tinjauan.'
                            : undefined,
                      }}
                    >
                      {(field) => {
                        const errors = getFieldErrorMessages(field.state.meta.errors)
                        const isInvalid = field.state.meta.isTouched && errors.length > 0
                        const noteDescribedBy = isInvalid
                          ? 'receipt-note-hint receipt-note-error'
                          : 'receipt-note-hint'
                        return (
                          <Field data-invalid={isInvalid || undefined}>
                            <FieldLabel htmlFor='receipt-note'>
                              {discrepancy?.isShortage
                                ? 'Catatan selisih berat (wajib)'
                                : 'Catatan serah terima (opsional)'}
                            </FieldLabel>
                            <FieldDescription id='receipt-note-hint'>
                              {discrepancy?.isShortage
                                ? 'Jelaskan kondisi timbangan atau barang saat diambil.'
                                : 'Catat kondisi kemasan atau keterangan timbangan bila perlu.'}
                            </FieldDescription>
                            <Textarea
                              ref={noteInputRef}
                              id='receipt-note'
                              name={field.name}
                              rows={2}
                              maxLength={300}
                              placeholder='Misal: ditimbang ulang bersama petani di pos sortir kebun'
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={isInvalid ? 'true' : 'false'}
                              aria-describedby={noteDescribedBy}
                            />
                            {isInvalid && <FieldError id='receipt-note-error' errors={errors} />}
                          </Field>
                        )
                      }}
                    </form.Field>
                  </>
                )
              }}
            </form.Subscribe>
          </FieldGroup>
        </CardContent>

        <CardFooter className='justify-end pt-4'>
          <form.Subscribe selector={(state) => state.values.weightText}>
            {(weightText) => {
              const parsedWeightKg = parseWeightInputKg(weightText)
              const weightError = validateActualWeightKg(parsedWeightKg)
              const discrepancy =
                parsedWeightKg !== null && !weightError
                  ? analyzeWeightDiscrepancy(order.quantityKg, parsedWeightKg, order.pricePerKg)
                  : null
              return (
                <Button type='submit' disabled={confirmReceiptMutation.isPending}>
                  {confirmReceiptMutation.isPending ? (
                    <Spinner data-icon='inline-start' />
                  ) : (
                    <CheckCircle2 data-icon='inline-start' aria-hidden='true' />
                  )}
                  <span>
                    {discrepancy?.isShortage ? 'Catat selisih berat' : 'Konfirmasi terima panen'}
                  </span>
                </Button>
              )
            }}
          </form.Subscribe>
        </CardFooter>
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <form.Subscribe selector={(state) => state.values.weightText}>
          {(weightText) => {
            const parsedWeightKg = parseWeightInputKg(weightText)
            const weightError = validateActualWeightKg(parsedWeightKg)
            const discrepancy =
              parsedWeightKg !== null && !weightError
                ? analyzeWeightDiscrepancy(order.quantityKg, parsedWeightKg, order.pricePerKg)
                : null
            return (
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {discrepancy?.isShortage
                      ? 'Catat selisih berat dan tinjau pesanan?'
                      : 'Selesaikan pesanan sekarang?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {discrepancy?.isShortage
                      ? `Berat aktual tercatat ${formatWeightKg(parsedWeightKg ?? 0)} dari ${formatWeightKg(order.quantityKg)} dipesan. Pesanan akan masuk status peninjauan.`
                      : `Berat aktual sebesar ${formatWeightKg(parsedWeightKg ?? 0)} akan tercatat sebagai Pangan Tersalurkan dan transaksi ditandai selesai.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {confirmReceiptMutation.isError && (
                  <Alert variant='destructive'>
                    <AlertDescription>{confirmReceiptMutation.error.message}</AlertDescription>
                  </Alert>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel autoFocus>Periksa lagi</AlertDialogCancel>
                  <AlertDialogAction
                    variant={discrepancy?.isShortage ? 'destructive' : 'default'}
                    disabled={confirmReceiptMutation.isPending}
                    onClick={handleConfirmSubmit}
                  >
                    {confirmReceiptMutation.isPending && <Spinner data-icon='inline-start' />}
                    <span>
                      {discrepancy?.isShortage ? 'Ya, catat selisih' : 'Ya, konfirmasi selesai'}
                    </span>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            )
          }}
        </form.Subscribe>
      </AlertDialog>
    </Card>
  )
}
