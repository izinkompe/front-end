'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  complaintPhotoAccept,
  isComplaintPhoto,
  maxComplaintPhotos,
  validateComplaintFiles,
} from '@/lib/data/complaint-helpers'

function formatFileSizeKb(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function ComplaintPhotoField({
  files,
  onFilesChange,
  externalError,
}: {
  files: File[]
  onFilesChange: (next: File[]) => void
  externalError?: string | null
}) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [selectionError, setSelectionError] = useState<string | null>(null)

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [files]
  )

  useEffect(() => {
    return () => {
      for (const item of previews) {
        URL.revokeObjectURL(item.url)
      }
    }
  }, [previews])

  const fileError = selectionError ?? externalError ?? validateComplaintFiles(files)
  const showError = Boolean(fileError)
  const describedBy = showError ? `${id}-hint ${id}-error` : `${id}-hint`

  function handleSelectFiles(incoming: FileList | null) {
    if (!incoming?.length) return
    const next = [...files, ...Array.from(incoming)]
    if (next.length > maxComplaintPhotos) {
      setSelectionError('Pilih maksimal 3 foto bukti.')
      onFilesChange(next.slice(0, maxComplaintPhotos))
    } else {
      const error = validateComplaintFiles(next)
      setSelectionError(error)
      onFilesChange(next)
    }
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  function handleRemoveFile(index: number) {
    const next = files.filter((_, itemIndex) => itemIndex !== index)
    setSelectionError(validateComplaintFiles(next))
    onFilesChange(next)
  }

  return (
    <Field data-invalid={showError || undefined}>
      <FieldLabel htmlFor={id}>Foto bukti (opsional)</FieldLabel>
      <Input
        ref={inputRef}
        id={id}
        name='photos'
        type='file'
        multiple
        accept={complaintPhotoAccept}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={describedBy}
        onChange={(event) => handleSelectFiles(event.target.files)}
      />
      <FieldDescription id={id + '-hint'}>
        Maksimal 3 foto JPEG atau PNG, 5 MB per foto.
      </FieldDescription>
      {showError && <FieldError id={id + '-error'} errors={[{ message: fileError as string }]} />}

      {previews.length > 0 && (
        <ul className='grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3'>
          {previews.map((item, index) => (
            <li
              key={`${item.file.name}-${item.file.size}-${index}`}
              className='flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2'
            >
              <div className='relative size-11 shrink-0 overflow-hidden rounded border border-border bg-background'>
                <Image
                  src={item.url}
                  alt={item.file.name}
                  fill
                  unoptimized
                  className='object-cover'
                />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-xs font-medium text-foreground'>{item.file.name}</p>
                <p className='text-xs text-muted-foreground tabular-nums'>
                  {formatFileSizeKb(item.file.size)}
                </p>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7 shrink-0'
                aria-label={`Hapus foto ${item.file.name}`}
                onClick={() => handleRemoveFile(index)}
              >
                <X className='size-3.5' aria-hidden='true' />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Field>
  )
}

export function ComplaintPhotos({ photos }: { photos?: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const safePhotos = photos?.filter(isComplaintPhoto)
  if (!safePhotos?.length) return null

  const activePhoto = selectedIndex !== null ? safePhotos[selectedIndex] : null

  return (
    <>
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
        {safePhotos.map((photo, index) => (
          <button
            key={index}
            type='button'
            onClick={() => setSelectedIndex(index)}
            className='group relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted/40 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
            aria-label={`Perbesar foto bukti ${index + 1}`}
          >
            <Image
              src={photo}
              alt={'Foto bukti ' + (index + 1)}
              fill
              unoptimized
              className='object-cover transition-transform group-hover:scale-105'
            />
            <span className='absolute right-1.5 bottom-1.5 inline-flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm'>
              <ZoomIn className='size-3.5' aria-hidden='true' />
            </span>
          </button>
        ))}
      </div>

      <Dialog open={activePhoto !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Foto bukti {selectedIndex !== null ? selectedIndex + 1 : 1}</DialogTitle>
          </DialogHeader>
          {activePhoto && (
            <div className='relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border bg-muted/30'>
              <Image
                src={activePhoto}
                alt={`Foto bukti ${selectedIndex !== null ? selectedIndex + 1 : 1}`}
                fill
                unoptimized
                className='object-contain'
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
