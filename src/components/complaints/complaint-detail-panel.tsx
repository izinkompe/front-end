'use client'

import Link from 'next/link'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Download } from 'lucide-react'
import { formatPlainRupiah } from '@/components/home/offer-card-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useReplyComplaint } from '@/hooks/api/use-complaints'
import {
  complaintStatusLabels,
  complaintTypeLabels,
  readComplaintPhotos,
  refundStatusLabels,
  validateComplaintFiles,
} from '@/lib/data/complaint-helpers'
import { isSafeProofImageUrl } from '@/lib/data/checkout-helpers'
import { formatDateTimeId } from '@/lib/data/offer-detail-helpers'
import type { Complaint } from '@/types/api/complaints'
import { ComplaintPhotoField, ComplaintPhotos } from './complaint-photo-field'

export function ComplaintDetailPanel({
  report,
  showOrder = false,
}: {
  report: Complaint
  showOrder?: boolean
}) {
  const id = useId()
  const reply = useReplyComplaint(report.id)
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const messageRef = useRef<HTMLTextAreaElement | null>(null)

  const proofUrl = isSafeProofImageUrl(report.refundProofUrl)
  const trimmedMessage = message.trim()
  const messageError =
    trimmedMessage.length === 0
      ? 'Tuliskan balasan klarifikasi terlebih dahulu.'
      : trimmedMessage.length > 2000
        ? 'Balasan maksimal 2.000 karakter.'
        : null
  const filesError = validateComplaintFiles(files)
  const showMessageError = Boolean((submitted || touched) && messageError)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitted(true)
    setSubmitError('')

    if (messageError) {
      messageRef.current?.focus()
      return
    }
    if (filesError) {
      return
    }

    setSubmitting(true)
    try {
      const attachments = await readComplaintPhotos(files)
      await reply.mutateAsync({
        message: trimmedMessage,
        attachments: attachments.length ? attachments : undefined,
      })
      setMessage('')
      setFiles([])
      setTouched(false)
      setSubmitted(false)
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : 'Coba kirim balasan lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <CardTitle>{complaintTypeLabels[report.type]}</CardTitle>
          <Badge variant={report.status === 'in_investigation' ? 'default' : 'secondary'}>
            {complaintStatusLabels[report.status]}
          </Badge>
        </div>
        <CardDescription className='flex flex-wrap items-center gap-x-3 gap-y-1'>
          <span className='tabular-nums'>{formatDateTimeId(report.createdAt)}</span>
          {showOrder && (
            <Link
              className='font-medium text-foreground underline underline-offset-4 hover:text-primary'
              href={'/pesanan/' + encodeURIComponent(report.orderId)}
            >
              Pesanan {report.orderId}
            </Link>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-4 text-sm'>
        <p className='wrap-anywhere whitespace-pre-wrap text-foreground'>{report.description}</p>
        <ComplaintPhotos photos={report.evidencePhotos} />

        {report.adminResolution && (
          <>
            <Separator />
            <section className='flex flex-col gap-1.5'>
              <h3 className='font-semibold text-foreground'>Keputusan administrator</h3>
              <p className='wrap-anywhere whitespace-pre-wrap text-foreground'>
                {report.adminResolution}
              </p>
              {report.resolvedAt && (
                <p className='text-xs text-muted-foreground tabular-nums'>
                  {formatDateTimeId(report.resolvedAt)}
                </p>
              )}
            </section>
          </>
        )}

        {(report.refundStatus || report.refundBankAccount) && (
          <>
            <Separator />
            <section className='flex flex-col gap-2.5'>
              <h3 className='font-semibold text-foreground'>Pengembalian dana</h3>
              <dl className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                <div className='flex flex-col gap-0.5'>
                  <dt className='text-sm text-muted-foreground'>Status transfer</dt>
                  <dd className='font-medium text-foreground'>
                    {report.refundStatus
                      ? refundStatusLabels[report.refundStatus]
                      : 'Menunggu keputusan administrator'}
                  </dd>
                </div>
                {report.refundAmount !== undefined && (
                  <div className='flex flex-col gap-0.5'>
                    <dt className='text-sm text-muted-foreground'>Nominal pengembalian</dt>
                    <dd className='font-semibold text-primary tabular-nums'>
                      {formatPlainRupiah(report.refundAmount)}
                    </dd>
                  </div>
                )}
                {report.refundBankAccount && (
                  <>
                    <div className='flex flex-col gap-0.5'>
                      <dt className='text-sm text-muted-foreground'>Rekening tujuan</dt>
                      <dd className='font-medium text-foreground'>
                        {report.refundBankAccount.bankName} (
                        {report.refundBankAccount.accountNumber})
                      </dd>
                    </div>
                    <div className='flex flex-col gap-0.5'>
                      <dt className='text-sm text-muted-foreground'>Atas nama</dt>
                      <dd className='font-medium text-foreground'>
                        {report.refundBankAccount.accountHolderName}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
              {proofUrl && (
                <Button
                  variant='outline'
                  size='sm'
                  className='w-fit'
                  nativeButton={false}
                  render={<a href={proofUrl} download='bukti-pengembalian' />}
                >
                  <Download data-icon='inline-start' aria-hidden='true' />
                  <span>Unduh bukti pengembalian</span>
                </Button>
              )}
            </section>
          </>
        )}

        {!!report.clarificationMessages?.length && (
          <>
            <Separator />
            <section className='flex flex-col gap-3'>
              <h3 className='font-semibold text-foreground'>Klarifikasi</h3>
              <ol className='flex flex-col gap-3'>
                {report.clarificationMessages.map((entry) => (
                  <li key={entry.id} className='flex flex-col gap-1.5 rounded-md bg-muted p-3'>
                    <div className='flex flex-wrap items-baseline justify-between gap-2'>
                      <p className='font-semibold text-foreground'>
                        {entry.senderRole === 'buyer' ? 'Anda' : entry.senderName}
                      </p>
                      <p className='text-sm text-muted-foreground tabular-nums'>
                        {formatDateTimeId(entry.createdAt)}
                      </p>
                    </div>
                    <p className='wrap-anywhere whitespace-pre-wrap text-foreground'>
                      {entry.message}
                    </p>
                    <ComplaintPhotos photos={entry.attachments} />
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}

        {report.status === 'in_investigation' && (
          <>
            <Separator />
            <form noValidate onSubmit={handleSubmit} className='flex flex-col gap-3'>
              <FieldGroup>
                <Field data-invalid={showMessageError || undefined}>
                  <FieldLabel htmlFor={id}>Balasan klarifikasi</FieldLabel>
                  <FieldDescription id={id + '-hint'}>
                    Tambahkan penjelasan atau bukti tambahan untuk administrator.
                  </FieldDescription>
                  <Textarea
                    ref={messageRef}
                    id={id}
                    name='message'
                    maxLength={2000}
                    rows={3}
                    value={message}
                    placeholder='Tulis balasan klarifikasi Anda'
                    aria-invalid={showMessageError ? 'true' : 'false'}
                    aria-describedby={showMessageError ? `${id}-hint ${id}-error` : `${id}-hint`}
                    onBlur={() => setTouched(true)}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                  {showMessageError && (
                    <FieldError id={id + '-error'} errors={[{ message: messageError as string }]} />
                  )}
                </Field>
                <ComplaintPhotoField
                  files={files}
                  onFilesChange={setFiles}
                  externalError={submitted ? filesError : null}
                />
              </FieldGroup>
              {submitError && (
                <Alert variant='destructive'>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              <Button type='submit' disabled={submitting} className='self-start'>
                {submitting && <Spinner data-icon='inline-start' />}
                <span>Kirim balasan</span>
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}
