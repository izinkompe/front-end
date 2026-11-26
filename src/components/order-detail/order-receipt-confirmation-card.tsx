'use client'

import { useRef, useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle2, Scale } from 'lucide-react'
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

  const [weightText, setWeightText] = useState(() => String(order.quantityKg))
  const [note, setNote] = useState('')
  const [weightTouched, setWeightTouched] = useState(false)
  const [noteTouched, setNoteTouched] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (order.status !== 'ready_for_pickup') {
    return null
  }

  const parsedWeightKg = parseWeightInputKg(weightText)
  const weightError = validateActualWeightKg(parsedWeightKg)
  const discrepancy =
    parsedWeightKg !== null && !weightError
      ? analyzeWeightDiscrepancy(order.quantityKg, parsedWeightKg, order.pricePerKg)
      : null

  const noteError =
    discrepancy?.isShortage && note.trim().length < 5
      ? 'Tuliskan catatan selisih berat minimal 5 karakter sebagai bukti tinjauan.'
      : null

  const showWeightError = (weightTouched || submitAttempted) && Boolean(weightError)
  const showNoteError = (noteTouched || submitAttempted) && Boolean(noteError)

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitAttempted(true)
    setWeightTouched(true)
    setNoteTouched(true)

    if (weightError || parsedWeightKg === null) {
      weightInputRef.current?.focus()
      return
    }
    if (noteError) {
      noteInputRef.current?.focus()
      return
    }

    setConfirmOpen(true)
  }

  function handleConfirmSubmit() {
    if (parsedWeightKg === null || weightError || noteError) return

    confirmReceiptMutation.mutate(
      {
        orderId: order.id,
        confirmedWeightKg: parsedWeightKg,
        note: note.trim() || undefined,
      },
      { onSuccess: () => setConfirmOpen(false) }
    )
  }

  const weightDescribedBy = showWeightError
    ? 'receipt-actual-weight-hint receipt-actual-weight-error'
    : 'receipt-actual-weight-hint'
  const noteDescribedBy = showNoteError
    ? 'receipt-note-hint receipt-note-error'
    : 'receipt-note-hint'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konfirmasi penerimaan panen</CardTitle>
        <CardDescription>
          Timbang hasil panen bersama petani lalu catat berat aktual yang Anda terima.
        </CardDescription>
      </CardHeader>

      <form noValidate onSubmit={handleFormSubmit}>
        <CardContent className='flex flex-col gap-4'>
          {confirmReceiptMutation.isError && !confirmOpen && (
            <Alert variant='destructive'>
              <AlertCircle aria-hidden='true' />
              <AlertDescription>{confirmReceiptMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field data-invalid={showWeightError || undefined}>
              <FieldLabel htmlFor='receipt-actual-weight'>Berat aktual diterima (kg)</FieldLabel>
              <FieldDescription id='receipt-actual-weight-hint'>
                Pesanan Anda sebesar {formatWeightKg(order.quantityKg)}. Ketelitian hingga 0,001 kg.
              </FieldDescription>

              <InputGroup>
                <InputGroupInput
                  ref={weightInputRef}
                  id='receipt-actual-weight'
                  name='confirmedWeightKg'
                  type='text'
                  inputMode='decimal'
                  placeholder='Contoh: 15'
                  value={weightText}
                  onBlur={() => setWeightTouched(true)}
                  onChange={(event) => setWeightText(event.target.value)}
                  aria-invalid={showWeightError ? 'true' : 'false'}
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
                  onClick={() => {
                    setWeightText(String(order.quantityKg))
                    setWeightTouched(true)
                  }}
                >
                  Sesuai pesanan ({formatWeightKg(order.quantityKg)})
                </Button>
              </div>

              {showWeightError && (
                <FieldError
                  id='receipt-actual-weight-error'
                  errors={[{ message: weightError as string }]}
                />
              )}
            </Field>

            {discrepancy?.isShortage && (
              <Alert variant='destructive'>
                <AlertCircle aria-hidden='true' />
                <AlertTitle>
                  Selisih berat kurang {formatWeightKg(discrepancy.absDifferenceKg)}
                </AlertTitle>
                <AlertDescription>
                  Nilai selisih sekitar {formatPlainRupiah(discrepancy.estimatedShortageRefund)}.
                  Pesanan akan ditandai dalam peninjauan untuk penanganan dan pengembalian selisih
                  dana.
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
                  Kelebihan berat dicatat sebagai Pangan Tersalurkan tanpa biaya tambahan dan
                  pesanan langsung selesai.
                </AlertDescription>
              </Alert>
            )}

            <Field data-invalid={showNoteError || undefined}>
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
                name='note'
                rows={2}
                maxLength={300}
                placeholder='Misal: ditimbang ulang bersama petani di pos sortir kebun'
                value={note}
                onBlur={() => setNoteTouched(true)}
                onChange={(event) => setNote(event.target.value)}
                aria-invalid={showNoteError ? 'true' : 'false'}
                aria-describedby={noteDescribedBy}
              />
              {showNoteError && (
                <FieldError id='receipt-note-error' errors={[{ message: noteError as string }]} />
              )}
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className='justify-end pt-4'>
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
        </CardFooter>
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
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
      </AlertDialog>
    </Card>
  )
}
