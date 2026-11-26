'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
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
import type { FarmerStoreSettings } from '@/types/api/farmer-management'

const COMMODITY_OPTIONS: ReadonlyArray<{ value: CommodityCategory; label: string }> = [
  { value: 'sayuran', label: 'Sayuran' },
  { value: 'buah', label: 'Buah' },
  { value: 'padi-biji', label: 'Padi & Biji' },
  { value: 'rempah-umbi', label: 'Rempah & Umbi' },
  { value: 'lainnya', label: 'Lainnya' },
]

function FarmerStoreForm({ settings }: { settings: FarmerStoreSettings }) {
  const updateMutation = useUpdateFarmerStoreSettings()

  const [storeName, setStoreName] = useState(settings.storeName)
  const [description, setDescription] = useState(settings.description)
  const [publicPickupNotes, setPublicPickupNotes] = useState(settings.publicPickupNotes)
  const [primaryCommodities, setPrimaryCommodities] = useState<CommodityCategory[]>(
    settings.primaryCommodities
  )
  const [savedNotice, setSavedNotice] = useState(false)

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
            className='flex flex-col gap-6'
            onSubmit={async (event) => {
              event.preventDefault()
              setSavedNotice(false)
              await updateMutation.mutateAsync({
                storeName,
                description,
                publicPickupNotes,
                primaryCommodities,
              })
              setSavedNotice(true)
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='store-name'>Nama toko atau kelompok tani</FieldLabel>
                <Input
                  id='store-name'
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                  required
                  minLength={3}
                  maxLength={100}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='store-description'>Deskripsi singkat toko</FieldLabel>
                <Textarea
                  id='store-description'
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={500}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='store-pickup-notes'>
                  Catatan pengambilan untuk pembeli
                </FieldLabel>
                <Textarea
                  id='store-pickup-notes'
                  rows={2}
                  value={publicPickupNotes}
                  onChange={(event) => setPublicPickupNotes(event.target.value)}
                  maxLength={240}
                />
                <FieldDescription>
                  Ditampilkan di profil publik sebelum pembeli melakukan reservasi.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Kategori komoditas utama</FieldLabel>
                <ToggleGroup
                  multiple
                  variant='outline'
                  value={primaryCommodities}
                  onValueChange={(values) => setPrimaryCommodities(values as CommodityCategory[])}
                  className='flex-wrap justify-start'
                >
                  {COMMODITY_OPTIONS.map((option) => (
                    <ToggleGroupItem key={option.value} value={option.value}>
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            </FieldGroup>

            <div className='flex justify-end'>
              <Button type='submit' disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Spinner data-icon='inline-start' />}
                <span>Simpan perubahan</span>
              </Button>
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
      <div className='flex flex-col gap-1'>
        <h1 className='type-h1 font-semibold text-foreground'>Toko Saya</h1>
        <p className='text-base text-muted-foreground'>
          Perbarui informasi toko publik yang dilihat pembeli pada halaman profil petani.
        </p>
      </div>
      <FarmerStoreForm key={settings.updatedAt} settings={settings} />
    </div>
  )
}
