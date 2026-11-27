'use client'

import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { AlertCircle, CalendarClock, ImagePlus, MessageSquare, RotateCcw } from 'lucide-react'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  useFarmerProposeOrderSchedule,
  useFarmerRestockDecision,
  useReplyFarmerComplaint,
} from '@/hooks/api/use-farmer'
import type { Complaint } from '@/types/api/complaints'
import {
  FarmerProposeScheduleRequestSchema,
  FarmerRestockDecisionRequestSchema,
  type FarmerRestockDecisionRequest,
  type Order,
} from '@/types/api/orders'

export function ScheduleProposalForm({
  order,
  onSuccess,
}: {
  order: Order
  onSuccess: (msg: string) => void
}) {
  const proposeSchedule = useFarmerProposeOrderSchedule(order.id)

  const form = useForm({
    defaultValues: {
      date: order.proposedScheduleSlot?.date ?? order.scheduleSlot.date,
      startTime: order.proposedScheduleSlot?.startTime ?? order.scheduleSlot.startTime,
      endTime: order.proposedScheduleSlot?.endTime ?? order.scheduleSlot.endTime,
      reason: '',
    },
    validators: {
      onSubmit: FarmerProposeScheduleRequestSchema,
    },
    onSubmit: async ({ value }) => {
      await proposeSchedule.mutateAsync({
        date: value.date,
        startTime: value.startTime,
        endTime: value.endTime,
        reason: value.reason.trim(),
      })
      form.reset()
      onSuccess('Usulan jadwal pengambilan baru telah dikirim ke pembeli.')
    },
  })

  return (
    <Card size='sm' className='bg-muted/20'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <CalendarClock className='icon-sm text-primary' aria-hidden='true' />
          <span>Usulkan jadwal pengambilan baru</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          className='flex flex-col gap-4'
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          {proposeSchedule.isError && (
            <Alert variant='destructive'>
              <AlertCircle />
              <AlertDescription>{proposeSchedule.error.message}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
              <form.Field name='date'>
                {(field) => {
                  const errors = getFieldErrorMessages(field.state.meta.errors)
                  const isInvalid = field.state.meta.isTouched && errors.length > 0
                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor='prop-date'>Tanggal</FieldLabel>
                      <Input
                        id='prop-date'
                        type='date'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid || undefined}
                      />
                      {isInvalid && <FieldError errors={errors} />}
                    </Field>
                  )
                }}
              </form.Field>
              <form.Field name='startTime'>
                {(field) => {
                  const errors = getFieldErrorMessages(field.state.meta.errors)
                  const isInvalid = field.state.meta.isTouched && errors.length > 0
                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor='prop-start'>Jam mulai</FieldLabel>
                      <Input
                        id='prop-start'
                        type='time'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid || undefined}
                      />
                      {isInvalid && <FieldError errors={errors} />}
                    </Field>
                  )
                }}
              </form.Field>
              <form.Field name='endTime'>
                {(field) => {
                  const errors = getFieldErrorMessages(field.state.meta.errors)
                  const isInvalid = field.state.meta.isTouched && errors.length > 0
                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor='prop-end'>Jam selesai</FieldLabel>
                      <Input
                        id='prop-end'
                        type='time'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid || undefined}
                      />
                      {isInvalid && <FieldError errors={errors} />}
                    </Field>
                  )
                }}
              </form.Field>
            </div>

            <form.Field name='reason'>
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor='prop-reason'>Alasan perubahan jadwal</FieldLabel>
                    <Textarea
                      id='prop-reason'
                      rows={2}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder='Contoh: Hujan deras menunda panen blok utara hingga siang'
                      maxLength={300}
                      aria-invalid={isInvalid || undefined}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>
          </FieldGroup>

          <div className='flex justify-end'>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type='submit'
                  size='sm'
                  disabled={isSubmitting || proposeSchedule.isPending}
                >
                  {(isSubmitting || proposeSchedule.isPending) && (
                    <Spinner data-icon='inline-start' />
                  )}
                  <span>Kirim usulan jadwal</span>
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function RestockDecisionForm({
  order,
  onSuccess,
}: {
  order: Order
  onSuccess: (msg: string) => void
}) {
  const restockMutation = useFarmerRestockDecision(order.id)

  const form = useForm({
    defaultValues: {
      decision: 'restocked',
      note: '',
    } as FarmerRestockDecisionRequest,
    validators: {
      onSubmit: FarmerRestockDecisionRequestSchema,
    },
    onSubmit: async ({ value }) => {
      await restockMutation.mutateAsync({
        decision: value.decision,
        note: value.note?.trim() || undefined,
      })
      onSuccess(
        value.decision === 'restocked'
          ? 'Stok pesanan batal dikembalikan ke stok tersedia.'
          : 'Stok pesanan batal dicatat tidak dikembalikan ke katalog.'
      )
    },
  })

  return (
    <Card size='sm' className='bg-muted/20'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <RotateCcw className='icon-sm text-primary' aria-hidden='true' />
          <span>Konfirmasi kelayakan stok pasca-pembatalan</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          className='flex flex-col gap-4'
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          {restockMutation.isError && (
            <Alert variant='destructive'>
              <AlertCircle />
              <AlertDescription>{restockMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <form.Field name='decision'>
              {(field) => (
                <Field>
                  <FieldLabel>
                    Tindakan untuk {order.quantityKg.toLocaleString('id-ID')} kg
                  </FieldLabel>
                  <ToggleGroup
                    value={[field.state.value]}
                    onValueChange={(values) => {
                      const next = values[0]
                      if (next === 'restocked' || next === 'discarded') {
                        field.handleChange(next)
                      }
                    }}
                    variant='outline'
                    className='flex-wrap justify-start'
                  >
                    <ToggleGroupItem value='restocked'>Kembalikan ke stok tersedia</ToggleGroupItem>
                    <ToggleGroupItem value='discarded'>
                      Jangan kembalikan (kondisi menurun)
                    </ToggleGroupItem>
                  </ToggleGroup>
                </Field>
              )}
            </form.Field>

            <form.Field name='note'>
              {(field) => (
                <Field>
                  <FieldLabel htmlFor='restock-note'>Catatan kondisi barang (opsional)</FieldLabel>
                  <Input
                    id='restock-note'
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='Contoh: Masih segar disimpan di ruang sejuk'
                    maxLength={240}
                  />
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          <div className='flex justify-end'>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type='submit'
                  size='sm'
                  disabled={isSubmitting || restockMutation.isPending}
                >
                  {(isSubmitting || restockMutation.isPending) && (
                    <Spinner data-icon='inline-start' />
                  )}
                  <span>Simpan keputusan stok</span>
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function ComplaintClarificationForm({
  complaint,
  onSuccess,
}: {
  complaint: Complaint
  onSuccess: (msg: string) => void
}) {
  const replyMutation = useReplyFarmerComplaint(complaint.id)
  const [attachments, setAttachments] = useState<string[]>([])
  const [fileError, setFileError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      message: '',
    },
    onSubmit: async ({ value }) => {
      const trimmed = value.message.trim()
      if (!trimmed) return
      await replyMutation.mutateAsync({
        message: trimmed,
        attachments: attachments.length > 0 ? attachments : undefined,
      })
      form.reset()
      setAttachments([])
      onSuccess('Tanggapan klarifikasi berhasil dikirim.')
    },
  })

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null)
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    if (attachments.length + files.length > 3) {
      setFileError('Maksimal 3 foto bukti timbangan atau kondisi barang.')
      return
    }
    for (const file of files) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setFileError('Format foto harus JPG atau PNG.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setFileError('Ukuran foto maksimal 5 MB.')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAttachments((prev) => [...prev.slice(0, 2), reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card size='sm' className='bg-muted/20'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <MessageSquare className='icon-sm text-primary' aria-hidden='true' />
          <span>Klarifikasi & bukti timbangan</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <p className='text-sm text-foreground'>{complaint.description}</p>

        {!!complaint.clarificationMessages?.length && (
          <ul className='flex flex-col gap-2'>
            {complaint.clarificationMessages.map((msg) => (
              <li key={msg.id}>
                <Card size='sm'>
                  <CardContent className='text-sm'>
                    <div className='flex items-center justify-between gap-2'>
                      <span className='font-semibold text-foreground'>{msg.senderName}</span>
                      <span className='text-meta text-muted-foreground'>
                        {new Date(msg.createdAt).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className='pt-1 text-foreground'>{msg.message}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}

        {['open', 'in_investigation'].includes(complaint.status) && (
          <form
            noValidate
            className='flex flex-col gap-3'
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            {(replyMutation.isError || fileError) && (
              <Alert variant='destructive'>
                <AlertCircle />
                <AlertDescription>{replyMutation.error?.message ?? fileError}</AlertDescription>
              </Alert>
            )}

            <form.Field name='message'>
              {(field) => (
                <Field>
                  <FieldLabel htmlFor='clarification-message'>Tanggapan petani</FieldLabel>
                  <Textarea
                    id='clarification-message'
                    rows={2}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='Jelaskan kronologi penimbangan atau kondisi barang'
                    maxLength={2000}
                  />
                </Field>
              )}
            </form.Field>

            <Field>
              <FieldLabel htmlFor='clarification-files'>Foto bukti timbangan (opsional)</FieldLabel>
              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  nativeButton={false}
                  render={<label htmlFor='clarification-files' className='cursor-pointer' />}
                >
                  <ImagePlus data-icon='inline-start' aria-hidden='true' />
                  <span>Unggah JPG/PNG ({attachments.length}/3)</span>
                </Button>
                <Input
                  id='clarification-files'
                  type='file'
                  accept='image/jpeg,image/png'
                  multiple
                  className='sr-only'
                  onChange={handleFileChange}
                />
              </div>
              <FieldDescription>Maksimal 3 foto, ukuran per berkas 5 MB.</FieldDescription>
            </Field>

            <div className='flex justify-end'>
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type='submit'
                    size='sm'
                    disabled={isSubmitting || replyMutation.isPending}
                  >
                    {(isSubmitting || replyMutation.isPending) && (
                      <Spinner data-icon='inline-start' />
                    )}
                    <span>Kirim klarifikasi</span>
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
