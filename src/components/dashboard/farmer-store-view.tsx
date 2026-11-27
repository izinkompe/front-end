'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  useFarmerStoreSettings,
  useUpdateFarmerStoreSettings,
} from '@/hooks/api/use-farmer-management'
import type { CommodityCategory } from '@/types/api/auth'
import {
  UpdateFarmerStoreSettingsRequestSchema,
  type FarmerStoreSettings,
} from '@/types/api/farmer-management'

const COMMODITY_OPTIONS: ReadonlyArray<{ value: CommodityCategory; label: string }> = [
  { value: 'sayuran', label: 'Sayuran' },
  { value: 'buah', label: 'Buah' },
  { value: 'padi-biji', label: 'Padi & Biji' },
  { value: 'rempah-umbi', label: 'Rempah & Umbi' },
  { value: 'lainnya', label: 'Lainnya' },
]

function FarmerStoreForm({ settings }: { settings: FarmerStoreSettings }) {
  const updateMutation = useUpdateFarmerStoreSettings()
  const [savedNotice, setSavedNotice] = useState(false)

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
      setSavedNotice(false)
      await updateMutation.mutateAsync(value)
      setSavedNotice(true)
    },
  })

  return (
    <div className='flex flex-col gap-6'>
      {savedNotice && (
        <Alert>
          <CheckCircle2 />
          <AlertDescription>Pengaturan toko berhasil disimpan.</AlertDescription>
        </Alert>
      )}

      {updateMutation.isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>{updateMutation.error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profil Toko Publik</CardTitle>
          <CardDescription>
            Terakhir diperbarui {new Date(settings.updatedAt).toLocaleDateString('id-ID')}
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
                        Catatan pengambilan untuk pembeli
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
                        Ditampilkan di profil publik sebelum pembeli melakukan reservasi.
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
                      onValueChange={(values) => field.handleChange(values as CommodityCategory[])}
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
  )
}

export function FarmerStoreView() {
  const { data: settings, isLoading, isError } = useFarmerStoreSettings()

  if (isLoading) {
    return (
      <div className='flex flex-col gap-4'>
        <Skeleton className='h-10 w-64' />
        <Skeleton className='h-80 w-full' />
      </div>
    )
  }

  if (isError || !settings) {
    return (
      <Alert variant='destructive'>
        <AlertCircle />
        <AlertDescription>Gagal memuat pengaturan toko petani.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <h1 className='type-h1 font-semibold text-foreground'>Toko Saya</h1>
      <FarmerStoreForm key={settings.updatedAt} settings={settings} />
    </div>
  )
}
