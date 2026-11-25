'use client'

import { useState } from 'react'
import { ArrowLeft, LocateFixed, MapPin, ShieldCheck } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
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
import { findNearestLocation, findRegionCoordinates, provinceGroups } from '@/lib/data/regions'
import type { FarmerStep4Values } from '@/types/api/auth'

interface StepFarmLocationProps {
  values: FarmerStep4Values
  errors: Partial<Record<keyof FarmerStep4Values, string>>
  onChange: (next: Partial<FarmerStep4Values>) => void
  onBack: () => void
  onNext: () => void
}

export function StepFarmLocation({
  values,
  errors,
  onChange,
  onBack,
  onNext,
}: StepFarmLocationProps) {
  const [locating, setLocating] = useState(false)
  const [locationInfo, setLocationInfo] = useState<string | null>(null)

  const selectedProvince =
    provinceGroups.find((province) => province.id === values.provinceId) ?? provinceGroups[0]

  function handleProvinceChange(nextProvinceId: string | null) {
    if (!nextProvinceId) return
    const province = provinceGroups.find((item) => item.id === nextProvinceId)
    const firstRegion = province?.regions[0]
    onChange({
      provinceId: nextProvinceId,
      areaName: firstRegion ? firstRegion.name : '',
      latitude: firstRegion ? firstRegion.lat : values.latitude,
      longitude: firstRegion ? firstRegion.lng : values.longitude,
    })
  }

  function handleAreaChange(nextAreaName: string | null) {
    if (!nextAreaName) return
    const coords = findRegionCoordinates(values.provinceId, nextAreaName)
    onChange({
      areaName: nextAreaName,
      latitude: coords ? coords.lat : values.latitude,
      longitude: coords ? coords.lng : values.longitude,
    })
  }

  function handleDetectGps() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationInfo(
        'HP atau browser ini belum mendukung deteksi otomatis. Pilih wilayah di bawah.'
      )
      return
    }

    setLocating(true)
    setLocationInfo(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = findNearestLocation(position.coords.latitude, position.coords.longitude)
        onChange({
          provinceId: nearest.provinceId,
          areaName: nearest.label,
          latitude: Number(position.coords.latitude.toFixed(5)),
          longitude: Number(position.coords.longitude.toFixed(5)),
        })
        setLocationInfo(`Titik lokasi berhasil ditemukan di sekitar ${nearest.label}.`)
        setLocating(false)
      },
      () => {
        setLocating(false)
        setLocationInfo(
          'Izin lokasi belum diaktifkan. Tidak apa-apa, cukup pilih Provinsi dan Wilayah di bawah.'
        )
      },
      { timeout: 8000 }
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        onNext()
      }}
      className='flex flex-col gap-6'
    >
      <div className='flex flex-col gap-2 text-center'>
        <h1 className='text-[clamp(1.5rem,1.25rem+1vw,2rem)] leading-tight font-semibold text-foreground'>
          Di mana tempat pembeli mengambil hasil panen?
        </h1>
        <p className='text-base leading-relaxed text-muted-foreground'>
          Pembeli akan datang langsung ke lokasi yang Anda tentukan untuk mengambil pesanan.
        </p>
      </div>

      <Alert>
        <ShieldCheck />
        <AlertTitle>Alamat lengkap Anda tetap aman</AlertTitle>
        <AlertDescription>
          Di katalog umum, pembeli hanya melihat nama wilayah umum (kecamatan/kabupaten). Alamat
          lengkap baru dibuka setelah pembeli memesan.
        </AlertDescription>
      </Alert>

      <div className='flex flex-col gap-2'>
        <Button
          type='button'
          variant='outline'
          className='w-full'
          disabled={locating}
          onClick={handleDetectGps}
        >
          {locating ? (
            <Spinner data-icon='inline-start' />
          ) : (
            <LocateFixed data-icon='inline-start' />
          )}
          <span>{locating ? 'Mencari lokasi HP Anda...' : 'Gunakan Lokasi HP Saya Otomatis'}</span>
        </Button>
        {locationInfo && (
          <p className='text-center text-sm text-muted-foreground'>{locationInfo}</p>
        )}
      </div>

      <FieldGroup>
        <Field data-invalid={Boolean(errors.provinceId) || undefined}>
          <FieldLabel htmlFor='farmer-province'>Provinsi</FieldLabel>
          <Select value={values.provinceId} onValueChange={handleProvinceChange}>
            <SelectTrigger
              id='farmer-province'
              className='w-full'
              aria-invalid={Boolean(errors.provinceId) || undefined}
            >
              <SelectValue placeholder='Pilih provinsi lokasi lahan' />
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
          {errors.provinceId && <FieldError errors={[{ message: errors.provinceId }]} />}
        </Field>

        <Field data-invalid={Boolean(errors.areaName) || undefined}>
          <FieldLabel htmlFor='farmer-area'>Wilayah / Kabupaten</FieldLabel>
          <Select value={values.areaName} onValueChange={handleAreaChange}>
            <SelectTrigger
              id='farmer-area'
              className='w-full'
              aria-invalid={Boolean(errors.areaName) || undefined}
            >
              <SelectValue placeholder='Pilih wilayah kabupaten atau sentra tani' />
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
          <div className='flex flex-wrap items-center gap-2 pt-0.5'>
            <Badge variant='secondary'>
              <MapPin data-icon='inline-start' />
              <span>Titik peta otomatis siap</span>
            </Badge>
            <span className='text-sm text-muted-foreground tabular-nums'>
              ({values.latitude.toFixed(4)}, {values.longitude.toFixed(4)})
            </span>
          </div>
          {errors.areaName && <FieldError errors={[{ message: errors.areaName }]} />}
        </Field>

        <Field data-invalid={Boolean(errors.fullAddress) || undefined}>
          <FieldLabel htmlFor='farmer-full-address'>
            Alamat lengkap lahan atau rumah pengambilan
          </FieldLabel>
          <Textarea
            id='farmer-full-address'
            rows={3}
            placeholder='Contoh: Jl. Raya Maribaya No. 45, RT 02 RW 05, Desa Langensari, Kec. Lembang'
            value={values.fullAddress}
            onChange={(event) => onChange({ fullAddress: event.target.value })}
            aria-invalid={Boolean(errors.fullAddress) || undefined}
          />
          {errors.fullAddress && <FieldError errors={[{ message: errors.fullAddress }]} />}
        </Field>

        <Field data-invalid={Boolean(errors.pickupNotes) || undefined}>
          <FieldLabel htmlFor='farmer-pickup-notes'>
            Patokan jalan &amp; pesan untuk pembeli saat mengambil barang
          </FieldLabel>
          <Textarea
            id='farmer-pickup-notes'
            rows={3}
            placeholder='Contoh: Masuk gang sebelah KUD, pagar warna hijau. Harap bawa keranjang atau karung sendiri.'
            value={values.pickupNotes}
            onChange={(event) => onChange({ pickupNotes: event.target.value })}
            aria-invalid={Boolean(errors.pickupNotes) || undefined}
          />
          <FieldDescription>
            Catatan ini membantu pembeli datang tepat waktu tanpa bingung mencari lokasi.
          </FieldDescription>
          {errors.pickupNotes && <FieldError errors={[{ message: errors.pickupNotes }]} />}
        </Field>
      </FieldGroup>

      <div className='flex flex-col gap-2.5'>
        <Button type='submit' size='lg' className='w-full rounded-full'>
          Lanjut ke Langkah 5: Rekening Bank
        </Button>
        <Button type='button' variant='ghost' className='w-full rounded-full' onClick={onBack}>
          <ArrowLeft data-icon='inline-start' />
          <span>Kembali ke Langkah 3</span>
        </Button>
      </div>
    </form>
  )
}
