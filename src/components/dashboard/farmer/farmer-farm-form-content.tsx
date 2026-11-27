'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, LocateFixed } from 'lucide-react'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useCreateFarmerFarm, useUpdateFarmerFarm } from '@/hooks/api/use-farmer-management'
import { getGeolocationErrorMessage, requestCurrentPosition } from '@/lib/geolocation'
import { findNearestLocation, findRegionCoordinates, provinceGroups } from '@/lib/data/regions'
import type { CommodityCategory } from '@/types/api/auth'
import {
  CreateFarmerFarmRequestSchema,
  UpdateFarmerFarmRequestSchema,
  type FarmerFarm,
  type FarmerFarmStatus,
} from '@/types/api/farmer-management'

const COMMODITY_OPTIONS: ReadonlyArray<{ value: CommodityCategory; label: string }> = [
  { value: 'sayuran', label: 'Sayuran' },
  { value: 'buah', label: 'Buah' },
  { value: 'padi-biji', label: 'Padi & Biji' },
  { value: 'rempah-umbi', label: 'Rempah & Umbi' },
  { value: 'lainnya', label: 'Lainnya' },
]

export function FarmFormContent({ farm }: { farm?: FarmerFarm }) {
  const router = useRouter()
  const isEdit = Boolean(farm)
  const createFarm = useCreateFarmerFarm()
  const updateFarm = useUpdateFarmerFarm(farm?.id ?? '')
  const activeMutation = isEdit ? updateFarm : createFarm
  const [selectedProvinceId, setSelectedProvinceId] = useState(provinceGroups[0].id)
  const [gpsStatus, setGpsStatus] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)

  const selectedProvince =
    provinceGroups.find((item) => item.id === selectedProvinceId) ?? provinceGroups[0]

  const form = useForm({
    defaultValues: {
      name: farm?.name ?? '',
      areaName: farm?.areaName ?? '',
      fullAddress: farm?.fullAddress ?? '',
      latitude: farm?.latitude !== undefined ? String(farm.latitude) : '',
      longitude: farm?.longitude !== undefined ? String(farm.longitude) : '',
      primaryCommodities: (farm?.primaryCommodities?.length
        ? farm.primaryCommodities
        : ['sayuran']) as CommodityCategory[],
      pickupNotes: farm?.pickupNotes ?? '',
      status: (farm?.status ?? 'active') as FarmerFarmStatus,
    },
    validators: {
      onSubmit: ({ value }) => {
        const parsedLat = value.latitude.trim() ? Number(value.latitude) : undefined
        const parsedLng = value.longitude.trim() ? Number(value.longitude) : undefined
        const candidate = {
          name: value.name,
          areaName: value.areaName,
          fullAddress: value.fullAddress,
          latitude: parsedLat,
          longitude: parsedLng,
          primaryCommodities: value.primaryCommodities,
          pickupNotes: value.pickupNotes.trim() || undefined,
          status: value.status,
        }
        const schema = isEdit ? UpdateFarmerFarmRequestSchema : CreateFarmerFarmRequestSchema
        const result = schema.safeParse(candidate)
        if (result.success) return undefined

        const fieldErrors: Record<string, string> = {}
        for (const issue of result.error.issues) {
          const path = issue.path[0]
          if (path && !fieldErrors[String(path)]) {
            fieldErrors[String(path)] = issue.message
          }
        }
        return { fields: fieldErrors }
      },
    },
    onSubmit: async ({ value }) => {
      const parsedLat = value.latitude.trim() ? Number(value.latitude) : undefined
      const parsedLng = value.longitude.trim() ? Number(value.longitude) : undefined
      const basePayload = {
        name: value.name.trim(),
        areaName: value.areaName.trim(),
        fullAddress: value.fullAddress.trim(),
        latitude: Number.isFinite(parsedLat) ? parsedLat : undefined,
        longitude: Number.isFinite(parsedLng) ? parsedLng : undefined,
        primaryCommodities: value.primaryCommodities,
        pickupNotes: value.pickupNotes.trim() || undefined,
      }
      if (isEdit) {
        await updateFarm.mutateAsync({ ...basePayload, status: value.status })
      } else {
        await createFarm.mutateAsync(basePayload)
      }
      router.push('/dashboard/kebun')
    },
  })

  function handleRegionFill(regionName: string | null) {
    if (!regionName) return
    form.setFieldValue('areaName', regionName)
    const coords = findRegionCoordinates(selectedProvinceId, regionName)
    if (coords) {
      form.setFieldValue('latitude', String(coords.lat))
      form.setFieldValue('longitude', String(coords.lng))
    }
  }

  async function handleDetectGps() {
    setLocating(true)
    setGpsStatus(null)

    const result = await requestCurrentPosition()
    if (!result.ok) {
      setGpsStatus(getGeolocationErrorMessage(result.reason, 'farmer'))
      setLocating(false)
      return
    }

    const nearest = findNearestLocation(result.latitude, result.longitude)
    setSelectedProvinceId(nearest.provinceId)
    form.setFieldValue('areaName', nearest.label)
    form.setFieldValue('latitude', String(Number(result.latitude.toFixed(5))))
    form.setFieldValue('longitude', String(Number(result.longitude.toFixed(5))))
    setGpsStatus(`Titik ditemukan di sekitar ${nearest.label}.`)
    setLocating(false)
  }

  return (
    <Card className='max-w-3xl'>
      <CardHeader>
        <CardTitle>{isEdit ? 'Perbarui data kebun' : 'Informasi kebun dan lokasi ambil'}</CardTitle>
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
          {activeMutation.isError && (
            <Alert variant='destructive'>
              <AlertCircle />
              <AlertDescription>{activeMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <form.Field name='name'>
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor='farm-form-name'>Nama kebun</FieldLabel>
                    <Input
                      id='farm-form-name'
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder='Contoh: Kebun Lembang Blok B'
                      maxLength={100}
                      aria-invalid={isInvalid || undefined}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Field>
                <FieldLabel htmlFor='farm-province-select'>Bantuan isi provinsi</FieldLabel>
                <Select
                  value={selectedProvinceId}
                  onValueChange={(value) => {
                    if (value) setSelectedProvinceId(value)
                  }}
                >
                  <SelectTrigger id='farm-province-select'>
                    <SelectValue placeholder='Pilih provinsi' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {provinceGroups.map((province) => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor='farm-region-preset'>Pilih wilayah sentra</FieldLabel>
                <Select onValueChange={handleRegionFill}>
                  <SelectTrigger id='farm-region-preset'>
                    <SelectValue placeholder='Pilih kabupaten atau kota' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {selectedProvince.regions.map((region) => (
                        <SelectItem key={region.id} value={region.name}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <form.Field name='areaName'>
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor='farm-form-area'>Kecamatan atau kabupaten</FieldLabel>
                    <Input
                      id='farm-form-area'
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder='Contoh: Lembang, Bandung Barat'
                      maxLength={120}
                      aria-invalid={isInvalid || undefined}
                    />
                    <FieldDescription>Tampil di katalog publik.</FieldDescription>
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name='fullAddress'>
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor='farm-form-address'>Alamat lengkap lokasi ambil</FieldLabel>
                    <Textarea
                      id='farm-form-address'
                      name={field.name}
                      rows={3}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder='Jalan, blok, RT/RW, desa, dan kecamatan'
                      maxLength={300}
                      aria-invalid={isInvalid || undefined}
                    />
                    <FieldDescription>Dibuka ke pembeli setelah reservasi.</FieldDescription>
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <Card size='sm' className='bg-muted/30'>
              <CardContent className='flex flex-col gap-3'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <span className='text-sm font-medium text-foreground'>Koordinat titik ambil</span>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    disabled={locating}
                    onClick={handleDetectGps}
                  >
                    {locating ? (
                      <Spinner data-icon='inline-start' />
                    ) : (
                      <LocateFixed data-icon='inline-start' aria-hidden='true' />
                    )}
                    <span>Gunakan lokasi perangkat</span>
                  </Button>
                </div>
                {gpsStatus && <p className='text-meta text-muted-foreground'>{gpsStatus}</p>}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <form.Field name='latitude'>
                    {(field) => {
                      const errors = getFieldErrorMessages(field.state.meta.errors)
                      const isInvalid = field.state.meta.isTouched && errors.length > 0
                      return (
                        <Field data-invalid={isInvalid || undefined}>
                          <FieldLabel htmlFor='farm-form-lat'>Latitude</FieldLabel>
                          <Input
                            id='farm-form-lat'
                            name={field.name}
                            type='number'
                            step='0.00001'
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) => field.handleChange(event.target.value)}
                            placeholder='Contoh: -6.8167'
                            aria-invalid={isInvalid || undefined}
                          />
                          {isInvalid && <FieldError errors={errors} />}
                        </Field>
                      )
                    }}
                  </form.Field>
                  <form.Field name='longitude'>
                    {(field) => {
                      const errors = getFieldErrorMessages(field.state.meta.errors)
                      const isInvalid = field.state.meta.isTouched && errors.length > 0
                      return (
                        <Field data-invalid={isInvalid || undefined}>
                          <FieldLabel htmlFor='farm-form-lng'>Longitude</FieldLabel>
                          <Input
                            id='farm-form-lng'
                            name={field.name}
                            type='number'
                            step='0.00001'
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) => field.handleChange(event.target.value)}
                            placeholder='Contoh: 107.6167'
                            aria-invalid={isInvalid || undefined}
                          />
                          {isInvalid && <FieldError errors={errors} />}
                        </Field>
                      )
                    }}
                  </form.Field>
                </div>
              </CardContent>
            </Card>

            <form.Field name='primaryCommodities'>
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel>Komoditas utama di kebun ini</FieldLabel>
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
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name='pickupNotes'>
              {(field) => {
                const errors = getFieldErrorMessages(field.state.meta.errors)
                const isInvalid = field.state.meta.isTouched && errors.length > 0
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor='farm-form-notes'>
                      Patokan lokasi dan catatan akses
                    </FieldLabel>
                    <Textarea
                      id='farm-form-notes'
                      name={field.name}
                      rows={2}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder='Contoh: Masuk gang sebelah KUD, akses mobil bak sampai gudang'
                      maxLength={240}
                      aria-invalid={isInvalid || undefined}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                )
              }}
            </form.Field>

            {isEdit && (
              <form.Field name='status'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor='farm-form-status'>Status penggunaan kebun</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        if (value === 'active' || value === 'archived') {
                          field.handleChange(value)
                        }
                      }}
                    >
                      <SelectTrigger id='farm-form-status'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='active'>Aktif</SelectItem>
                          <SelectItem value='archived'>Diarsipkan</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
            )}
          </FieldGroup>

          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              nativeButton={false}
              render={<Link href='/dashboard/kebun' />}
            >
              Batal
            </Button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type='submit' disabled={isSubmitting || activeMutation.isPending}>
                  {(isSubmitting || activeMutation.isPending) && (
                    <Spinner data-icon='inline-start' />
                  )}
                  <span>{isEdit ? 'Simpan perubahan kebun' : 'Simpan kebun'}</span>
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
