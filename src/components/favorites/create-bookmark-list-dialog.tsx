'use client'

import { useState, type FormEvent } from 'react'
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
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const createList = useCreateBookmarkList()

  function resetForm() {
    setName('')
    setDescription('')
    setErrorMessage(null)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm()
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    const parsed = CreateBookmarkListRequestSchema.safeParse({
      name,
      description: description.trim() ? description : undefined,
    })

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Periksa kembali data daftar bookmark.')
      return
    }

    try {
      const created = await createList.mutateAsync(parsed.data)
      resetForm()
      onOpenChange(false)
      onCreated?.(created)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Gagal membuat daftar bookmark baru.'
      )
    }
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
          onSubmit={handleSubmit}
          className='flex flex-col gap-4'
        >
          <div className='flex flex-col gap-2'>
            <Label htmlFor='bookmark-list-name'>Nama daftar</Label>
            <Input
              id='bookmark-list-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Contoh: Stok Sayur Mingguan'
              maxLength={60}
              autoFocus
              required
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='bookmark-list-description'>Catatan (opsional)</Label>
            <Textarea
              id='bookmark-list-description'
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder='Contoh: Komoditas segar untuk kebutuhan dapur akhir pekan'
              maxLength={160}
              rows={3}
            />
          </div>

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
          <Button
            type='submit'
            form='create-bookmark-list-form'
            disabled={createList.isPending || !name.trim()}
          >
            {createList.isPending && <Spinner data-icon='inline-start' />}
            <span>Buat daftar</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
