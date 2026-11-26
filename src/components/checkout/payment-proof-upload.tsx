'use client'

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import { AlertCircle, ImageUp, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useSubmitPaymentProof } from '@/hooks/api/use-payments'
import { isSafeProofImageUrl, validatePaymentProofFile } from '@/lib/data/checkout-helpers'

interface PaymentProofUploadProps {
  orderId: string
  isReupload: boolean
  disabled: boolean
  existingProofUrl?: string
  onSubmitted?: () => void
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Gagal membaca file gambar.'))
      }
    }
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
    reader.readAsDataURL(file)
  })
}

export function PaymentProofUpload({
  orderId,
  isReupload,
  disabled,
  existingProofUrl,
  onSubmitted,
}: PaymentProofUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const submitPaymentMutation = useSubmitPaymentProof(orderId)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [fileError, setFileError] = useState<string | null>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null
    if (!nextFile) {
      return
    }

    const validationError = validatePaymentProofFile({
      name: nextFile.name,
      type: nextFile.type,
      size: nextFile.size,
    })

    if (validationError) {
      setSelectedFile(null)
      setPreviewDataUrl(null)
      setFileError(validationError)
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(nextFile)
      setSelectedFile(nextFile)
      setPreviewDataUrl(dataUrl)
      setFileError(null)
    } catch {
      setSelectedFile(null)
      setPreviewDataUrl(null)
      setFileError('File gambar tidak dapat dibaca. Pilih foto lain.')
    }
  }

  function handleClearFile() {
    setSelectedFile(null)
    setPreviewDataUrl(null)
    setFileError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled) return

    const validationError = validatePaymentProofFile(
      selectedFile
        ? {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
          }
        : null
    )

    if (validationError || !previewDataUrl) {
      setFileError(validationError || 'Pilih foto bukti transfer berformat JPG atau PNG.')
      fileInputRef.current?.focus()
      return
    }

    await submitPaymentMutation.mutateAsync({
      proofUrl: previewDataUrl,
      notes: notes.trim() || undefined,
    })

    onSubmitted?.()
  }

  const safePreview = isSafeProofImageUrl(previewDataUrl ?? existingProofUrl)
  const hasFileError = Boolean(fileError)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isReupload ? 'Unggah ulang bukti transfer' : 'Unggah bukti transfer'}
        </CardTitle>
        <CardDescription>
          Administrator mencocokkan bukti ini dengan dana masuk sebelum pesanan disiapkan.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form noValidate onSubmit={handleSubmit} className='flex flex-col gap-5'>
          {submitPaymentMutation.isError && (
            <Alert variant='destructive'>
              <AlertCircle aria-hidden='true' />
              <AlertDescription>{submitPaymentMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field data-invalid={hasFileError || undefined}>
              <FieldLabel htmlFor='payment-proof-file'>Foto bukti transfer</FieldLabel>
              <FieldDescription id='payment-proof-hint'>
                Format JPG atau PNG, ukuran maksimal 5 MB.
              </FieldDescription>

              <div className='flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4'>
                <input
                  ref={fileInputRef}
                  id='payment-proof-file'
                  name='proofFile'
                  type='file'
                  accept='image/jpeg,image/png'
                  disabled={disabled || submitPaymentMutation.isPending}
                  onChange={handleFileChange}
                  aria-describedby={
                    hasFileError ? 'payment-proof-hint payment-proof-error' : 'payment-proof-hint'
                  }
                  aria-invalid={hasFileError || undefined}
                  className='block w-full cursor-pointer text-sm text-foreground file:mr-3 file:min-h-10 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
                />

                {selectedFile && (
                  <div className='flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm'>
                    <span className='truncate font-medium text-foreground'>
                      {selectedFile.name}
                    </span>
                    <Button
                      type='button'
                      variant='ghost'
                      size='xs'
                      onClick={handleClearFile}
                      disabled={submitPaymentMutation.isPending}
                    >
                      <Trash2 data-icon='inline-start' aria-hidden='true' />
                      Hapus
                    </Button>
                  </div>
                )}

                {safePreview && (
                  <div className='overflow-hidden rounded-lg border border-border bg-background'>
                    <Image
                      src={safePreview}
                      alt='Pratinjau bukti transfer'
                      width={640}
                      height={360}
                      unoptimized
                      className='max-h-64 w-full object-contain'
                    />
                  </div>
                )}
              </div>

              {hasFileError && (
                <FieldError id='payment-proof-error' errors={[{ message: fileError as string }]} />
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor='payment-proof-notes'>Catatan transfer (opsional)</FieldLabel>
              <Textarea
                id='payment-proof-notes'
                name='notes'
                rows={2}
                placeholder='Misal: transfer atas nama Dapur Umum Kasih via BRI'
                value={notes}
                disabled={disabled || submitPaymentMutation.isPending}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Field>
          </FieldGroup>

          <Button
            type='submit'
            size='lg'
            disabled={disabled || submitPaymentMutation.isPending}
            className='w-full sm:w-auto sm:self-end'
          >
            {submitPaymentMutation.isPending ? (
              <Spinner data-icon='inline-start' />
            ) : (
              <ImageUp data-icon='inline-start' aria-hidden='true' />
            )}
            <span>
              {submitPaymentMutation.isPending
                ? 'Mengirim bukti...'
                : isReupload
                  ? 'Kirim ulang bukti transfer'
                  : 'Kirim bukti transfer'}
            </span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
