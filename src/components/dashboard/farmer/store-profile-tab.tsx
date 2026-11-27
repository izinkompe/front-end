'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, CheckCircle2, Landmark, Lock } from 'lucide-react'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  useFarmerBankAccount,
  useUpdateFarmerStoreSettings,
} from '@/hooks/api/use-farmer-management'
import type { CommodityCategory } from '@/types/api/auth'
import {
  UpdateFarmerStoreSettingsRequestSchema,
  type FarmerStoreSettings,
} from '@/types/api/farmer-management'
import { BankAccountSheet } from './bank-account-sheet'

const COMMODITY_OPTIONS: ReadonlyArray<{ value: CommodityCategory; label: string }> = [
  { value: 'sayuran', label: 'Sayuran' },
  { value: 'buah', label: 'Buah' },
  { value: 'padi-biji', label: 'Padi & Biji' },
  { value: 'rempah-umbi', label: 'Rempah & Umbi' },
  { value: 'lainnya', label: 'Lainnya' },
]

export function StoreProfileTab({ settings }: { settings: FarmerStoreSettings }) {
  const updateMutation = useUpdateFarmerStoreSettings()
  const { data: bankAccount } = useFarmerBankAccount()
  const [savedNotice, setSavedNotice] = useState<string | null>(null)
  const [bankSheetOpen, setBankSheetOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      storeName: settings.storeName,
      description: settings.description,
      publicPickupNotes: settings.publicPickupNotes,
      primaryCommodities: settings.primaryCommodities,
    },
    validators: {
      onSubmit: UpdateFarmerStoreSettingsRequestSchema,
    },
    onSubmit: async ({ value }) => {
      setSavedNotice(null)
      await updateMutation.mutateAsync(value)
      setSavedNotice('Pengaturan toko berhasil disimpan.')
    },
  })

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start'>
      <div className='flex flex-col gap-4'>
        {savedNotice && (
          <Alert>
            <CheckCircle2 />
            <AlertDescription>{savedNotice}</AlertDescription>
          </Alert>
        )}

        {updateMutation.isError && (
          <Alert variant='destructive'>
            <AlertCircle />
            <AlertDescription>{updateMutation.error.message}</AlertDescription>
          </Alert>
        )}

        <Card className='min-w-0'>
          <CardHeader>
            <CardTitle>Profil toko publik</CardTitle>
            <CardDescription>
              Diperbarui {new Date(settings.updatedAt).toLocaleDateString('id-ID')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              noValidate
              className='flex flex-col gap-6'
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void form.handleSubmit()
              }}
            >
              <FieldGroup>
                <form.Field name='storeName'>
                  {(field) => {
                    const errors = getFieldErrorMessages(field.state.meta.errors)
                    const isInvalid = field.state.meta.isTouched && errors.length > 0
                    return (
                      <Field data-invalid={isInvalid || undefined}>
                        <FieldLabel htmlFor='store-name'>Nama toko atau kelompok tani</FieldLabel>
                        <Input
                          id='store-name'
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          maxLength={100}
                          aria-invalid={isInvalid || undefined}
                        />
                        {isInvalid && <FieldError errors={errors} />}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name='description'>
                  {(field) => {
                    const errors = getFieldErrorMessages(field.state.meta.errors)
                    const isInvalid = field.state.meta.isTouched && errors.length > 0
                    return (
                      <Field data-invalid={isInvalid || undefined}>
                        <FieldLabel htmlFor='store-description'>Deskripsi singkat toko</FieldLabel>
                        <Textarea
                          id='store-description'
                          name={field.name}
                          rows={3}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          maxLength={500}
                          aria-invalid={isInvalid || undefined}
                        />
                        {isInvalid && <FieldError errors={errors} />}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name='publicPickupNotes'>
                  {(field) => {
                    const errors = getFieldErrorMessages(field.state.meta.errors)
                    const isInvalid = field.state.meta.isTouched && errors.length > 0
                    return (
                      <Field data-invalid={isInvalid || undefined}>
                        <FieldLabel htmlFor='store-pickup-notes'>
                          Catatan pengambilan umum
                        </FieldLabel>
                        <Textarea
                          id='store-pickup-notes'
                          name={field.name}
                          rows={2}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          maxLength={240}
                          aria-invalid={isInvalid || undefined}
                        />
                        <FieldDescription>
                          Tampil di profil toko sebelum pembeli memesan.
                        </FieldDescription>
                        {isInvalid && <FieldError errors={errors} />}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name='primaryCommodities'>
                  {(field) => (
                    <Field>
                      <FieldLabel>Kategori komoditas utama</FieldLabel>
                      <ToggleGroup
                        multiple
                        variant='outline'
                        value={field.state.value}
                        onValueChange={(values) =>
                          field.handleChange(values as CommodityCategory[])
                        }
                        className='flex-wrap justify-start'
                      >
                        {COMMODITY_OPTIONS.map((option) => (
                          <ToggleGroupItem key={option.value} value={option.value}>
                            {option.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </Field>
                  )}
                </form.Field>
              </FieldGroup>

              <div className='flex justify-end'>
                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button
                      type='submit'
                      className='w-full sm:w-auto'
                      disabled={isSubmitting || updateMutation.isPending}
                    >
                      {(isSubmitting || updateMutation.isPending) && (
                        <Spinner data-icon='inline-start' />
                      )}
                      <span>Simpan perubahan</span>
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className='min-w-0'>
        <CardHeader>
          <div className='flex items-start justify-between gap-2'>
            <CardTitle>Rekening penerimaan dana</CardTitle>
            <Badge variant='outline'>
              <Lock className='icon-xs' aria-hidden='true' />
              <span>Privat</span>
            </Badge>
          </div>
          <CardDescription>Tampil pada tagihan pesanan aktif.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3 text-sm'>
          <div className='flex items-center gap-2 text-foreground'>
            <Landmark className='icon-sm text-muted-foreground' aria-hidden='true' />
            <span className='font-medium'>{bankAccount?.bankName || 'Belum diisi'}</span>
          </div>
          <div>
            <p className='text-meta text-muted-foreground'>Nomor rekening</p>
            <p className='font-mono font-medium text-foreground'>
              {bankAccount?.accountNumber || 'Belum ada nomor rekening'}
            </p>
          </div>
          <div>
            <p className='text-meta text-muted-foreground'>Pemilik rekening</p>
            <p className='text-foreground'>{bankAccount?.accountHolderName || '-'}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant='outline'
            className='w-full sm:w-auto'
            onClick={() => setBankSheetOpen(true)}
          >
            Ubah rekening
          </Button>
        </CardFooter>
      </Card>

      <BankAccountSheet
        open={bankSheetOpen}
        onOpenChange={setBankSheetOpen}
        initialAccount={
          bankAccount ?? {
            bankName: 'BRI',
            accountNumber: '',
            accountHolderName: '',
          }
        }
        onSaved={() => setSavedNotice('Rekening penerimaan dana berhasil diperbarui.')}
      />
    </div>
  )
}
