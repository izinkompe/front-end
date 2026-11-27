'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useCreateBookmarkList, type HydratedBookmarkList } from '@/hooks/api/use-favorites'
import { CreateBookmarkListRequestSchema } from '@/types/api/auth'

interface CreateBookmarkListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (list: HydratedBookmarkList) => void
}

export function CreateBookmarkListDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateBookmarkListDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const createList = useCreateBookmarkList()

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null)

      const parsed = CreateBookmarkListRequestSchema.safeParse({
        name: value.name,
        description: value.description.trim() ? value.description : undefined,
      })

      if (!parsed.success) {
        setErrorMessage(parsed.error.issues[0]?.message ?? 'Periksa kembali data daftar bookmark.')
        return
      }

      try {
        const created = await createList.mutateAsync(parsed.data)
        form.reset()
        setErrorMessage(null)
        onOpenChange(false)
        onCreated?.(created)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Gagal membuat daftar bookmark baru.'
        )
      }
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset()
      setErrorMessage(null)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Buat daftar bookmark baru</DialogTitle>
          <DialogDescription>
            Kelompokkan komoditas panen favorit Anda ke dalam daftar khusus agar lebih mudah
            dipantau.
          </DialogDescription>
        </DialogHeader>

        <form
          id='create-bookmark-list-form'
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
          className='flex flex-col gap-4'
        >
          <form.Field
            name='name'
            validators={{
              onChange: ({ value }) => {
                const trimmed = value.trim()
                if (!trimmed) return 'Nama daftar wajib diisi.'
                if (trimmed.length > 60) return 'Nama daftar maksimal 60 karakter.'
                return undefined
              },
            }}
          >
            {(field) => {
              const errors = getFieldErrorMessages(field.state.meta.errors)
              const isInvalid = field.state.meta.isTouched && errors.length > 0
              return (
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='bookmark-list-name'>Nama daftar</Label>
                  <Input
                    id='bookmark-list-name'
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder='Contoh: Stok Sayur Mingguan'
                    maxLength={60}
                    autoFocus
                    aria-invalid={isInvalid || undefined}
                  />
                  {isInvalid && (
                    <p role='alert' className='text-sm text-destructive'>
                      {errors[0]?.message}
                    </p>
                  )}
                </div>
              )
            }}
          </form.Field>

          <form.Field name='description'>
            {(field) => (
              <div className='flex flex-col gap-2'>
                <Label htmlFor='bookmark-list-description'>Catatan (opsional)</Label>
                <Textarea
                  id='bookmark-list-description'
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder='Contoh: Komoditas segar untuk kebutuhan dapur akhir pekan'
                  maxLength={160}
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          {errorMessage && (
            <p role='alert' className='text-sm text-destructive'>
              {errorMessage}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleOpenChange(false)}
            disabled={createList.isPending}
          >
            Batal
          </Button>
          <form.Subscribe
            selector={(state) => ({ name: state.values.name, isSubmitting: state.isSubmitting })}
          >
            {({ name, isSubmitting }) => (
              <Button
                type='submit'
                form='create-bookmark-list-form'
                disabled={isSubmitting || createList.isPending || !name.trim()}
              >
                {(isSubmitting || createList.isPending) && <Spinner data-icon='inline-start' />}
                <span>Buat daftar</span>
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
