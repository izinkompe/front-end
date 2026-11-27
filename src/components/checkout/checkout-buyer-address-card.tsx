'use client'

import { useRef, useState } from 'react'
import { MapPin, Pencil, Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useSaveBuyerAddress } from '@/hooks/api/use-auth'
import { validateBuyerAddress } from '@/lib/data/checkout-helpers'
import type { UserAddress } from '@/types/api/auth'
import type { OrderBuyerAddress } from '@/types/api/orders'

interface CheckoutBuyerAddressCardProps {
  isLoggedIn: boolean
  organizationName?: string
  addresses: ReadonlyArray<UserAddress>
  selectedAddressId: string
  customDraftAddress: OrderBuyerAddress | null
  onSelectAddressId: (addressId: string) => void
  onSelectCustomAddress: (address: OrderBuyerAddress) => void
  onRequireAuth: () => void
}

export function CheckoutBuyerAddressCard({
  isLoggedIn,
  organizationName,
  addresses,
  selectedAddressId,
  customDraftAddress,
  onSelectAddressId,
  onSelectCustomAddress,
  onRequireAuth,
}: CheckoutBuyerAddressCardProps) {
  const saveAddressMutation = useSaveBuyerAddress()
  const labelInputRef = useRef<HTMLInputElement | null>(null)
  const areaInputRef = useRef<HTMLInputElement | null>(null)
  const fullAddressInputRef = useRef<HTMLTextAreaElement | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | undefined>(undefined)
  const [label, setLabel] = useState('')
  const [areaName, setAreaName] = useState('')
  const [fullAddress, setFullAddress] = useState('')
  const [touched, setTouched] = useState({ label: false, areaName: false, fullAddress: false })
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const errors = validateBuyerAddress({ label, areaName, fullAddress })
  const showLabelError = (touched.label || submitAttempted) && Boolean(errors.label)
  const showAreaError = (touched.areaName || submitAttempted) && Boolean(errors.areaName)
  const showFullError = (touched.fullAddress || submitAttempted) && Boolean(errors.fullAddress)

  function openNewDialog() {
    if (!isLoggedIn) {
      onRequireAuth()
      return
    }
    setEditingAddressId(undefined)
    setLabel('')
    setAreaName('')
    setFullAddress('')
    setTouched({ label: false, areaName: false, fullAddress: false })
    setSubmitAttempted(false)
    setDialogOpen(true)
  }

  function openEditDialog(target: {
    id?: string
    label: string
    areaName: string
    fullAddress: string
  }) {
    if (!isLoggedIn) {
      onRequireAuth()
      return
    }
    setEditingAddressId(target.id)
    setLabel(target.label)
    setAreaName(target.areaName)
    setFullAddress(target.fullAddress)
    setTouched({ label: false, areaName: false, fullAddress: false })
    setSubmitAttempted(false)
    setDialogOpen(true)
  }

  async function handleSaveAddress() {
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

    const updatedUser = await saveAddressMutation.mutateAsync({
      id: editingAddressId,
      label: label.trim(),
      areaName: areaName.trim(),
      fullAddress: fullAddress.trim(),
      setAsDefault: true,
    })

    const saved =
      (editingAddressId
        ? updatedUser.addresses?.find((item) => item.id === editingAddressId)
        : undefined) ??
      updatedUser.addresses?.find((item) => item.isDefault) ??
      updatedUser.addresses?.[updatedUser.addresses.length - 1]

    if (saved) {
      onSelectAddressId(saved.id)
      onSelectCustomAddress({
        label: saved.label,
        areaName: saved.areaName,
        fullAddress: saved.fullAddress,
      })
    }

    setDialogOpen(false)
  }

  const activeAddress =
    addresses.find((addr) => addr.id === selectedAddressId) ??
    addresses.find((addr) => addr.isDefault) ??
    addresses[0]

  return (
    <Card>
      <CardHeader className='flex flex-col items-start justify-between gap-3 sm:flex-row'>
        <div className='flex min-w-0 flex-col gap-1'>
          <CardTitle>Alamat pembeli</CardTitle>
          <CardDescription>
            {organizationName
              ? `Alamat untuk ${organizationName}. Pengambilan tetap dilakukan mandiri di lokasi petani.`
              : 'Digunakan sebagai identitas tujuan pembeli pada nota pesanan.'}
          </CardDescription>
        </div>

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={openNewDialog}
          className='shrink-0'
        >
          <Plus data-icon='inline-start' aria-hidden='true' />
          <span>Tambah alamat</span>
        </Button>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        {!isLoggedIn ? (
          <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4'>
            <p className='text-sm text-muted-foreground'>
              Masuk dengan akun pembeli untuk memilih atau mengganti alamat tersimpan.
            </p>
            <Button type='button' variant='outline' size='sm' onClick={onRequireAuth}>
              Masuk untuk pilih alamat
            </Button>
          </div>
        ) : addresses.length === 0 && !customDraftAddress ? (
          <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4'>
            <div className='flex items-center gap-2.5 text-sm text-muted-foreground'>
              <MapPin className='size-4 shrink-0' aria-hidden='true' />
              <span>Belum ada alamat tersimpan pada akun Anda.</span>
            </div>
            <Button type='button' size='sm' onClick={openNewDialog}>
              Isi alamat pembeli
            </Button>
          </div>
        ) : (
          <RadioGroup
            value={activeAddress?.id ?? ''}
            onValueChange={(value) => {
              const nextId = String(value)
              onSelectAddressId(nextId)
              const matched = addresses.find((addr) => addr.id === nextId)
              if (matched) {
                onSelectCustomAddress({
                  label: matched.label,
                  areaName: matched.areaName,
                  fullAddress: matched.fullAddress,
                })
              }
            }}
          >
            {addresses.map((address) => {
              const radioId = `buyer-address-${address.id}`
              return (
                <div
                  key={address.id}
                  className='flex flex-col gap-2 rounded-lg border border-border p-3.5 transition-colors has-data-checked:border-primary/40 has-data-checked:bg-primary/5'
                >
                  <div className='flex items-start justify-between gap-2'>
                    <label
                      htmlFor={radioId}
                      className='flex min-w-0 flex-1 cursor-pointer items-start gap-3'
                    >
                      <RadioGroupItem id={radioId} value={address.id} className='mt-0.5 shrink-0' />
                      <span className='flex min-w-0 flex-1 flex-col gap-1'>
                        <span className='flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground'>
                          <span>{address.label}</span>
                          {address.isDefault && <Badge variant='secondary'>Utama</Badge>}
                        </span>
                        <span className='text-sm text-foreground'>{address.fullAddress}</span>
                        <span className='text-xs text-muted-foreground'>{address.areaName}</span>
                      </span>
                    </label>

                    <Button
                      type='button'
                      variant='ghost'
                      size='xs'
                      onClick={() => openEditDialog(address)}
                      aria-label={`Ubah alamat ${address.label}`}
                      className='shrink-0'
                    >
                      <Pencil data-icon='inline-start' aria-hidden='true' />
                      <span>Ubah</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </RadioGroup>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='gap-5 p-6 sm:max-w-lg'>
          <DialogHeader className='gap-1.5 pr-10'>
            <DialogTitle>
              {editingAddressId ? 'Ubah alamat pembeli' : 'Tambah alamat pembeli'}
            </DialogTitle>
            <DialogDescription>
              Perubahan alamat disimpan ke akun Anda dan dipakai untuk pesanan ini.
            </DialogDescription>
          </DialogHeader>

          {saveAddressMutation.isError && (
            <Alert variant='destructive'>
              <AlertDescription>{saveAddressMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field data-invalid={showLabelError || undefined}>
              <FieldLabel htmlFor='buyer-address-label'>Label alamat</FieldLabel>
              <Input
                ref={labelInputRef}
                id='buyer-address-label'
                name='addressLabel'
                type='text'
                placeholder='Contoh: Dapur Utama atau Gudang Cabang'
                value={label}
                onBlur={() => setTouched((prev) => ({ ...prev, label: true }))}
                onChange={(event) => {
                  setTouched((prev) => ({ ...prev, label: true }))
                  setLabel(event.target.value)
                }}
                aria-describedby={showLabelError ? 'buyer-address-label-error' : undefined}
                aria-invalid={showLabelError || undefined}
              />
              {showLabelError && (
                <FieldError
                  id='buyer-address-label-error'
                  errors={[{ message: errors.label as string }]}
                />
              )}
            </Field>

            <Field data-invalid={showAreaError || undefined}>
              <FieldLabel htmlFor='buyer-address-area'>Kecamatan dan kota</FieldLabel>
              <Input
                ref={areaInputRef}
                id='buyer-address-area'
                name='addressArea'
                type='text'
                autoComplete='address-level2'
                placeholder='Contoh: Coblong, Bandung'
                value={areaName}
                onBlur={() => setTouched((prev) => ({ ...prev, areaName: true }))}
                onChange={(event) => {
                  setTouched((prev) => ({ ...prev, areaName: true }))
                  setAreaName(event.target.value)
                }}
                aria-describedby={showAreaError ? 'buyer-address-area-error' : undefined}
                aria-invalid={showAreaError || undefined}
              />
              {showAreaError && (
                <FieldError
                  id='buyer-address-area-error'
                  errors={[{ message: errors.areaName as string }]}
                />
              )}
            </Field>

            <Field data-invalid={showFullError || undefined}>
              <FieldLabel htmlFor='buyer-address-full'>Alamat lengkap</FieldLabel>
              <Textarea
                ref={fullAddressInputRef}
                id='buyer-address-full'
                name='fullAddress'
                rows={3}
                autoComplete='street-address'
                placeholder='Nama jalan, nomor bangunan, RT/RW, atau patokan tempat'
                value={fullAddress}
                onBlur={() => setTouched((prev) => ({ ...prev, fullAddress: true }))}
                onChange={(event) => {
                  setTouched((prev) => ({ ...prev, fullAddress: true }))
                  setFullAddress(event.target.value)
                }}
                aria-describedby={showFullError ? 'buyer-address-full-error' : undefined}
                aria-invalid={showFullError || undefined}
              />
              {showFullError && (
                <FieldError
                  id='buyer-address-full-error'
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
            <Button
              type='button'
              onClick={handleSaveAddress}
              disabled={saveAddressMutation.isPending}
            >
              {saveAddressMutation.isPending && <Spinner data-icon='inline-start' />}
              <span>{saveAddressMutation.isPending ? 'Menyimpan...' : 'Simpan alamat'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
