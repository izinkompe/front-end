'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useCreateComplaint } from '@/hooks/api/use-complaints'
import {
  complaintTypeLabels,
  readComplaintPhotos,
  validateComplaintDescription,
  validateComplaintFiles,
  validateRefundBankField,
} from '@/lib/data/complaint-helpers'
import { ComplaintTypeSchema, type ComplaintType } from '@/types/api/complaints'
import type { Order } from '@/types/api/orders'
import { ComplaintPhotoField } from './complaint-photo-field'

const reportTypes = ComplaintTypeSchema.options.filter((type) => type !== 'cancellation_request')

const bankFields = [
  { name: 'bankName', label: 'Nama bank', placeholder: 'Misal: BRI, BCA, Mandiri', max: 60 },
  {
    name: 'accountNumber',
    label: 'Nomor rekening',
    placeholder: '5 sampai 24 digit angka',
    max: 24,
  },
  {
    name: 'accountHolderName',
    label: 'Nama pemilik rekening',
    placeholder: 'Sesuai buku tabungan',
    max: 120,
  },
] as const

type BankFieldKey = (typeof bankFields)[number]['name']

export function OrderComplaintDialog({
  order,
  cancellation = false,
}: {
  order: Order
  cancellation?: boolean
}) {
  const id = useId()
  const mutation = useCreateComplaint()
  const defaultType: ComplaintType = cancellation
    ? 'cancellation_request'
    : order.receiptConfirmedAt && order.status === 'disputed'
      ? 'weight_discrepancy'
      : 'quality_issue'

  const [open, setOpen] = useState(false)
  const [type, setType] = useState<ComplaintType>(defaultType)
  const [description, setDescription] = useState(
    defaultType === 'weight_discrepancy' ? (order.weightDiscrepancyNote ?? '') : ''
  )
  const [files, setFiles] = useState<File[]>([])
  const [bankValues, setBankValues] = useState<Record<BankFieldKey, string>>({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const descriptionRef = useRef<HTMLTextAreaElement | null>(null)
  const bankInputRefs = useRef<Partial<Record<BankFieldKey, HTMLInputElement | null>>>({})

  const needsAccount =
    cancellation ||
    type === 'pickup_failure' ||
    (type === 'weight_discrepancy' && (order.confirmedWeightKg ?? 0) < order.quantityKg)

  const descriptionError = validateComplaintDescription(description, cancellation)
  const filesError = cancellation ? null : validateComplaintFiles(files)
  const bankErrors: Record<BankFieldKey, string | null> = {
    bankName: needsAccount ? validateRefundBankField('bankName', bankValues.bankName) : null,
    accountNumber: needsAccount
      ? validateRefundBankField('accountNumber', bankValues.accountNumber)
      : null,
    accountHolderName: needsAccount
      ? validateRefundBankField('accountHolderName', bankValues.accountHolderName)
      : null,
  }

  function resetForm() {
    setType(defaultType)
    setDescription(defaultType === 'weight_discrepancy' ? (order.weightDiscrepancyNote ?? '') : '')
    setFiles([])
    setBankValues({ bankName: '', accountNumber: '', accountHolderName: '' })
    setTouched({})
    setSubmitted(false)
    setSubmitError('')
  }

  function handleTypeChange(nextType: ComplaintType | null) {
    if (!nextType) return
    setType(nextType)
    if (nextType === 'weight_discrepancy' && !description.trim() && order.weightDiscrepancyNote) {
      setDescription(order.weightDiscrepancyNote)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitted(true)
    setSubmitError('')

    if (descriptionError) {
      descriptionRef.current?.focus()
      return
    }
    if (filesError) {
      return
    }
    if (needsAccount) {
      for (const field of bankFields) {
        if (bankErrors[field.name]) {
          bankInputRefs.current[field.name]?.focus()
          return
        }
      }
    }

    setSubmitting(true)
    try {
      const evidencePhotos = cancellation ? undefined : await readComplaintPhotos(files)
      await mutation.mutateAsync({
        orderId: order.id,
        type,
        description: description.trim(),
        evidencePhotos: evidencePhotos?.length ? evidencePhotos : undefined,
        refundBankAccount: needsAccount
          ? {
              bankName: bankValues.bankName.trim(),
              accountNumber: bankValues.accountNumber.trim(),
              accountHolderName: bankValues.accountHolderName.trim(),
            }
          : undefined,
      })
      setOpen(false)
      resetForm()
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : 'Coba kirim pengaduan lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const showDescriptionError = Boolean((submitted || touched.description) && descriptionError)
  const descriptionDescribedBy = showDescriptionError
    ? `${id}-description-hint ${id}-description-error`
    : `${id}-description-hint`

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger render={<Button variant='outline' />}>
        {cancellation ? 'Ajukan pembatalan' : 'Laporkan masalah'}
      </DialogTrigger>
      <DialogContent className='max-h-[calc(100dvh-2rem)] overflow-y-auto'>
        <DialogHeader className='pr-8'>
          <DialogTitle>
            {cancellation ? 'Ajukan pembatalan pesanan' : 'Laporkan masalah pesanan'}
          </DialogTitle>
          <DialogDescription>
            {cancellation
              ? 'Administrator akan meninjau permintaan pembatalan sebelum dana dikembalikan secara manual.'
              : 'Lampirkan keterangan dan foto bukti untuk ditinjau administrator.'}
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <FieldGroup>
            {!cancellation && (
              <Field>
                <FieldLabel htmlFor={id + '-type'}>Jenis masalah</FieldLabel>
                <Select name='type' value={type} onValueChange={handleTypeChange}>
                  <SelectTrigger id={id + '-type'} className='w-full'>
                    <SelectValue>{complaintTypeLabels[type]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {reportTypes.map((value) => (
                        <SelectItem value={value} key={value}>
                          {complaintTypeLabels[value]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field data-invalid={showDescriptionError || undefined}>
              <FieldLabel htmlFor={id + '-description'}>
                {cancellation ? 'Alasan pembatalan' : 'Kronologi masalah'}
              </FieldLabel>
              <FieldDescription id={id + '-description-hint'}>
                Minimal 5 karakter, maksimal 2.000 karakter.
              </FieldDescription>
              <Textarea
                ref={descriptionRef}
                id={id + '-description'}
                name='description'
                maxLength={2000}
                rows={3}
                value={description}
                placeholder={
                  cancellation
                    ? 'Jelaskan alasan pembatalan pesanan Anda'
                    : 'Jelaskan kondisi hasil panen atau kendala saat pengambilan'
                }
                aria-invalid={showDescriptionError ? 'true' : 'false'}
                aria-describedby={descriptionDescribedBy}
                onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
                onChange={(event) => setDescription(event.target.value)}
              />
              {showDescriptionError && (
                <FieldError
                  id={id + '-description-error'}
                  errors={[{ message: descriptionError as string }]}
                />
              )}
            </Field>

            {!cancellation && (
              <ComplaintPhotoField
                files={files}
                onFilesChange={setFiles}
                externalError={submitted ? filesError : null}
              />
            )}

            {needsAccount && (
              <FieldSet>
                <FieldLegend>Rekening pengembalian dana</FieldLegend>
                <FieldDescription>
                  Digunakan administrator untuk transfer manual apabila pengembalian disetujui.
                </FieldDescription>
                <FieldGroup>
                  {bankFields.map(({ name, label, placeholder, max }) => {
                    const fieldError = bankErrors[name]
                    const showFieldError = Boolean((submitted || touched[name]) && fieldError)
                    const fieldId = `${id}-${name}`
                    return (
                      <Field key={name} data-invalid={showFieldError || undefined}>
                        <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
                        <Input
                          ref={(node) => {
                            bankInputRefs.current[name] = node
                          }}
                          id={fieldId}
                          name={name}
                          maxLength={max}
                          placeholder={placeholder}
                          inputMode={name === 'accountNumber' ? 'numeric' : undefined}
                          value={bankValues[name]}
                          aria-invalid={showFieldError ? 'true' : 'false'}
                          aria-describedby={showFieldError ? `${fieldId}-error` : undefined}
                          onBlur={() => setTouched((prev) => ({ ...prev, [name]: true }))}
                          onChange={(event) => {
                            const nextValue =
                              name === 'accountNumber'
                                ? event.target.value.replace(/\D/g, '')
                                : event.target.value
                            setBankValues((prev) => ({ ...prev, [name]: nextValue }))
                          }}
                        />
                        {showFieldError && (
                          <FieldError
                            id={`${fieldId}-error`}
                            errors={[{ message: fieldError as string }]}
                          />
                        )}
                      </Field>
                    )
                  })}
                </FieldGroup>
              </FieldSet>
            )}
          </FieldGroup>

          {submitError && (
            <Alert variant='destructive'>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={submitting}
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type='submit' disabled={submitting}>
              {submitting && <Spinner data-icon='inline-start' />}
              <span>{cancellation ? 'Kirim permintaan pembatalan' : 'Kirim pengaduan'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
