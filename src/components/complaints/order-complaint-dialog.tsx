'use client'

import { useId, useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
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
  const [files, setFiles] = useState<File[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const descriptionRef = useRef<HTMLTextAreaElement | null>(null)
  const bankInputRefs = useRef<Partial<Record<BankFieldKey, HTMLInputElement | null>>>({})

  const filesError = cancellation ? null : validateComplaintFiles(files)

  const form = useForm({
    defaultValues: {
      type: defaultType as ComplaintType,
      description: defaultType === 'weight_discrepancy' ? (order.weightDiscrepancyNote ?? '') : '',
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
    },
    onSubmit: async ({ value }) => {
      if (submitting) return
      setSubmitted(true)
      setSubmitError('')

      const needsAccount =
        cancellation ||
        value.type === 'pickup_failure' ||
        (value.type === 'weight_discrepancy' && (order.confirmedWeightKg ?? 0) < order.quantityKg)

      if (validateComplaintDescription(value.description, cancellation)) {
        descriptionRef.current?.focus()
        return
      }
      if (filesError) {
        return
      }
      if (needsAccount) {
        for (const field of bankFields) {
          if (validateRefundBankField(field.name, value[field.name])) {
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
          type: value.type,
          description: value.description.trim(),
          evidencePhotos: evidencePhotos?.length ? evidencePhotos : undefined,
          refundBankAccount: needsAccount
            ? {
                bankName: value.bankName.trim(),
                accountNumber: value.accountNumber.trim(),
                accountHolderName: value.accountHolderName.trim(),
              }
            : undefined,
        })
        setOpen(false)
        form.reset()
        setFiles([])
        setSubmitted(false)
        setSubmitError('')
      } catch (cause) {
        setSubmitError(cause instanceof Error ? cause.message : 'Coba kirim pengaduan lagi.')
      } finally {
        setSubmitting(false)
      }
    },
  })

  function resetForm() {
    form.reset()
    setFiles([])
    setSubmitted(false)
    setSubmitError('')
  }

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

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
          className='flex flex-col gap-4'
        >
          <FieldGroup>
            {!cancellation && (
              <form.Field name='type'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={id + '-type'}>Jenis masalah</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(nextType) => {
                        if (!nextType) return
                        field.handleChange(nextType)
                        if (
                          nextType === 'weight_discrepancy' &&
                          !form.state.values.description.trim() &&
                          order.weightDiscrepancyNote
                        ) {
                          form.setFieldValue('description', order.weightDiscrepancyNote)
                        }
                      }}
                    >
                      <SelectTrigger id={id + '-type'} className='w-full'>
                        <SelectValue>{complaintTypeLabels[field.state.value]}</SelectValue>
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
              </form.Field>
            )}

            <form.Field
              name='description'
              validators={{
                onChange: ({ value }) =>
                  validateComplaintDescription(value, cancellation) ?? undefined,
              }}
            >
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                const descriptionDescribedBy = isInvalid
                  ? `${id}-description-hint ${id}-description-error`
                  : `${id}-description-hint`
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={id + '-description'}>
                      {cancellation ? 'Alasan pembatalan' : 'Kronologi masalah'}
                    </FieldLabel>
                    <FieldDescription id={id + '-description-hint'}>
                      Minimal 5 karakter, maksimal 2.000 karakter.
                    </FieldDescription>
                    <Textarea
                      ref={descriptionRef}
                      id={id + '-description'}
                      name={field.name}
                      maxLength={2000}
                      rows={3}
                      value={field.state.value}
                      placeholder={
                        cancellation
                          ? 'Jelaskan alasan pembatalan pesanan Anda'
                          : 'Jelaskan kondisi hasil panen atau kendala saat pengambilan'
                      }
                      aria-invalid={isInvalid ? 'true' : 'false'}
                      aria-describedby={descriptionDescribedBy}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {isInvalid && <FieldError id={id + '-description-error'} errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            {!cancellation && (
              <ComplaintPhotoField
                files={files}
                onFilesChange={setFiles}
                externalError={submitted ? filesError : null}
              />
            )}

            <form.Subscribe selector={(state) => state.values.type}>
              {(selectedType) => {
                const needsAccount =
                  cancellation ||
                  selectedType === 'pickup_failure' ||
                  (selectedType === 'weight_discrepancy' &&
                    (order.confirmedWeightKg ?? 0) < order.quantityKg)

                if (!needsAccount) return null

                return (
                  <FieldSet>
                    <FieldLegend>Rekening pengembalian dana</FieldLegend>
                    <FieldDescription>
                      Digunakan administrator untuk transfer manual apabila pengembalian disetujui.
                    </FieldDescription>
                    <FieldGroup>
                      {bankFields.map(({ name, label, placeholder, max }) => (
                        <form.Field
                          key={name}
                          name={name}
                          validators={{
                            onChange: ({ value }) =>
                              validateRefundBankField(name, value) ?? undefined,
                          }}
                        >
                          {(field) => {
                            const errors = getFieldErrorMessages(field.state.meta.errors)
                            const isInvalid = field.state.meta.isTouched && errors.length > 0
                            const fieldId = `${id}-${name}`
                            return (
                              <Field data-invalid={isInvalid || undefined}>
                                <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
                                <Input
                                  ref={(node) => {
                                    bankInputRefs.current[name] = node
                                  }}
                                  id={fieldId}
                                  name={field.name}
                                  maxLength={max}
                                  placeholder={placeholder}
                                  inputMode={name === 'accountNumber' ? 'numeric' : undefined}
                                  value={field.state.value}
                                  aria-invalid={isInvalid ? 'true' : 'false'}
                                  aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => {
                                    const nextValue =
                                      name === 'accountNumber'
                                        ? event.target.value.replace(/\D/g, '')
                                        : event.target.value
                                    field.handleChange(nextValue)
                                  }}
                                />
                                {isInvalid && (
                                  <FieldError id={`${fieldId}-error`} errors={errors} />
                                )}
                              </Field>
                            )
                          }}
                        </form.Field>
                      ))}
                    </FieldGroup>
                  </FieldSet>
                )
              }}
            </form.Subscribe>
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
