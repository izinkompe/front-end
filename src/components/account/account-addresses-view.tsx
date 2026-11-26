'use client'

import { useRef, useState } from 'react'
import { Check, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentUser, useDeleteBuyerAddress, useSaveBuyerAddress } from '@/hooks/api/use-auth'
import { validateBuyerAddress } from '@/lib/data/checkout-helpers'
import type { UserAddress } from '@/types/api/auth'

export function AccountAddressesView() {
  const { data: currentUser } = useCurrentUser()
  const saveAddressMutation = useSaveBuyerAddress()
  const deleteAddressMutation = useDeleteBuyerAddress()

  const labelInputRef = useRef<HTMLInputElement | null>(null)
  const areaInputRef = useRef<HTMLInputElement | null>(null)
  const fullAddressInputRef = useRef<HTMLTextAreaElement | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UserAddress | null>(null)
  const [editingId, setEditingId] = useState<string | undefined>(undefined)
  const [label, setLabel] = useState('')
  const [areaName, setAreaName] = useState('')
  const [fullAddress, setFullAddress] = useState('')
  const [touched, setTouched] = useState({ label: false, areaName: false, fullAddress: false })
  const [submitAttempted, setSubmitAttempted] = useState(false)

  if (!currentUser) {
    return null
  }

  const addresses = currentUser.addresses ?? []
  const errors = validateBuyerAddress({ label, areaName, fullAddress })
  const showLabelError = (touched.label || submitAttempted) && Boolean(errors.label)
  const showAreaError = (touched.areaName || submitAttempted) && Boolean(errors.areaName)
  const showFullError = (touched.fullAddress || submitAttempted) && Boolean(errors.fullAddress)

  function openNewDialog() {
    setEditingId(undefined)
    setLabel('')
    setAreaName('')
    setFullAddress('')
    setTouched({ label: false, areaName: false, fullAddress: false })
    setSubmitAttempted(false)
    setDialogOpen(true)
  }

  function openEditDialog(address: UserAddress) {
    setEditingId(address.id)
    setLabel(address.label)
    setAreaName(address.areaName)
    setFullAddress(address.fullAddress)
    setTouched({ label: false, areaName: false, fullAddress: false })
    setSubmitAttempted(false)
    setDialogOpen(true)
  }

  async function handleSave() {
    setSubmitAttempted(true)
    setTouched({ label: true, areaName: true, fullAddress: true })

    if (errors.label) {
      labelInputRef.current?.focus()
      return
    }
    if (errors.areaName) {
      areaInputRef.current?.focus()
      return
    }
    if (errors.fullAddress) {
      fullAddressInputRef.current?.focus()
      return
    }

    await saveAddressMutation.mutateAsync({
      id: editingId,
      label: label.trim(),
      areaName: areaName.trim(),
      fullAddress: fullAddress.trim(),
      setAsDefault: editingId ? undefined : addresses.length === 0,
    })

    setDialogOpen(false)
  }

  async function handleSetDefault(address: UserAddress) {
    await saveAddressMutation.mutateAsync({
      id: address.id,
      label: address.label,
      areaName: address.areaName,
      fullAddress: address.fullAddress,
      setAsDefault: true,
    })
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    await deleteAddressMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alamat Tersimpan</CardTitle>
        <CardAction>
          <Button type='button' size='sm' onClick={openNewDialog}>
            <Plus data-icon='inline-start' aria-hidden='true' />
            <span>Tambah alamat</span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        {deleteAddressMutation.isError && (
          <Alert variant='destructive'>
            <AlertDescription>{deleteAddressMutation.error.message}</AlertDescription>
          </Alert>
        )}

        {addresses.length === 0 ? (
          <Empty className='border border-dashed'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <MapPin aria-hidden='true' />
              </EmptyMedia>
              <EmptyTitle>Belum ada alamat tersimpan</EmptyTitle>
              <EmptyDescription>
                Simpan alamat dapur, toko, atau gudang untuk mempercepat proses checkout.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type='button' size='sm' onClick={openNewDialog}>
                Tambah alamat pertama
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className='flex flex-col gap-3'>
            {addresses.map((address) => (
              <div
                key={address.id}
                className='flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-start sm:justify-between'
              >
                <div className='flex min-w-0 flex-1 flex-col gap-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <p className='font-semibold text-foreground'>{address.label}</p>
                    {address.isDefault && <Badge variant='secondary'>Utama</Badge>}
                  </div>
                  <p className='text-sm text-foreground'>{address.fullAddress}</p>
                  <p className='text-xs text-muted-foreground'>{address.areaName}</p>
                </div>

                <div className='flex shrink-0 flex-wrap items-center gap-2'>
                  {!address.isDefault && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      disabled={saveAddressMutation.isPending}
                      onClick={() => handleSetDefault(address)}
                    >
                      <Check data-icon='inline-start' aria-hidden='true' />
                      <span>Jadikan utama</span>
                    </Button>
                  )}
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => openEditDialog(address)}
                  >
                    <Pencil data-icon='inline-start' aria-hidden='true' />
                    <span>Ubah</span>
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setDeleteTarget(address)}
                    aria-label={`Hapus alamat ${address.label}`}
                  >
                    <Trash2 data-icon='inline-start' aria-hidden='true' />
                    <span>Hapus</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='gap-5 p-6 sm:max-w-lg'>
          <DialogHeader className='gap-1.5 pr-10'>
            <DialogTitle>{editingId ? 'Ubah alamat' : 'Tambah alamat'}</DialogTitle>
            <DialogDescription>
              Alamat dipakai sebagai tujuan pada nota pesanan PanganTani.
            </DialogDescription>
          </DialogHeader>

          {saveAddressMutation.isError && (
            <Alert variant='destructive'>
              <AlertDescription>{saveAddressMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field data-invalid={showLabelError || undefined}>
              <FieldLabel htmlFor='account-address-label'>Label alamat</FieldLabel>
              <Input
                ref={labelInputRef}
                id='account-address-label'
                name='addressLabel'
                type='text'
                placeholder='Contoh: Dapur Utama'
                value={label}
                onBlur={() => setTouched((prev) => ({ ...prev, label: true }))}
                onChange={(event) => setLabel(event.target.value)}
                aria-invalid={showLabelError}
                aria-describedby={showLabelError ? 'account-address-label-error' : undefined}
              />
              {showLabelError && (
                <FieldError
                  id='account-address-label-error'
                  errors={[{ message: errors.label as string }]}
                />
              )}
            </Field>

            <Field data-invalid={showAreaError || undefined}>
              <FieldLabel htmlFor='account-address-area'>Kecamatan dan kota</FieldLabel>
              <Input
                ref={areaInputRef}
                id='account-address-area'
                name='addressArea'
                type='text'
                autoComplete='address-level2'
                placeholder='Contoh: Coblong, Bandung'
                value={areaName}
                onBlur={() => setTouched((prev) => ({ ...prev, areaName: true }))}
                onChange={(event) => setAreaName(event.target.value)}
                aria-invalid={showAreaError}
                aria-describedby={showAreaError ? 'account-address-area-error' : undefined}
              />
              {showAreaError && (
                <FieldError
                  id='account-address-area-error'
                  errors={[{ message: errors.areaName as string }]}
                />
              )}
            </Field>

            <Field data-invalid={showFullError || undefined}>
              <FieldLabel htmlFor='account-address-full'>Alamat lengkap</FieldLabel>
              <Textarea
                ref={fullAddressInputRef}
                id='account-address-full'
                name='fullAddress'
                rows={3}
                autoComplete='street-address'
                placeholder='Nama jalan, nomor bangunan, RT/RW, atau patokan tempat'
                value={fullAddress}
                onBlur={() => setTouched((prev) => ({ ...prev, fullAddress: true }))}
                onChange={(event) => setFullAddress(event.target.value)}
                aria-invalid={showFullError}
                aria-describedby={showFullError ? 'account-address-full-error' : undefined}
              />
              {showFullError && (
                <FieldError
                  id='account-address-full-error'
                  errors={[{ message: errors.fullAddress as string }]}
                />
              )}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDialogOpen(false)}
              disabled={saveAddressMutation.isPending}
            >
              Batal
            </Button>
            <Button type='button' onClick={handleSave} disabled={saveAddressMutation.isPending}>
              {saveAddressMutation.isPending && <Spinner data-icon='inline-start' />}
              <span>{saveAddressMutation.isPending ? 'Menyimpan...' : 'Simpan alamat'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus alamat tersimpan?</AlertDialogTitle>
            <AlertDialogDescription>
              Alamat {deleteTarget?.label} akan dihapus dari daftar alamat akun Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              disabled={deleteAddressMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteAddressMutation.isPending && <Spinner data-icon='inline-start' />}
              <span>Hapus alamat</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
