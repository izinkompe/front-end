'use client'

import { useState } from 'react'
import { AlertCircle, MapPin, Plus } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateFarmerFarm,
  useFarmerFarms,
  useUpdateFarmerFarm,
} from '@/hooks/api/use-farmer-management'
import type { FarmerFarm } from '@/types/api/farmer-management'

function FarmRowCard({ farm }: { farm: FarmerFarm }) {
  const updateFarm = useUpdateFarmerFarm(farm.id)
  const isArchived = farm.status === 'archived'

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-col gap-1'>
            <CardTitle>{farm.name}</CardTitle>
            <CardDescription className='flex items-center gap-1.5'>
              <MapPin className='size-4 shrink-0' aria-hidden='true' />
              <span>{farm.areaName}</span>
            </CardDescription>
          </div>
          <Badge variant={isArchived ? 'secondary' : 'default'}>
            {isArchived ? 'Diarsipkan' : 'Aktif'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-2 text-sm text-muted-foreground'>
        <p className='text-foreground'>{farm.fullAddress}</p>
        {farm.pickupNotes && <p>Catatan ambil: {farm.pickupNotes}</p>}
        <div className='flex flex-wrap gap-1.5 pt-1'>
          {farm.primaryCommodities.map((item) => (
            <Badge key={item} variant='outline'>
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant='outline'
          disabled={updateFarm.isPending}
          onClick={() =>
            updateFarm.mutate({
              name: farm.name,
              areaName: farm.areaName,
              fullAddress: farm.fullAddress,
              primaryCommodities:
                farm.primaryCommodities.length > 0 ? farm.primaryCommodities : ['sayuran'],
              pickupNotes: farm.pickupNotes,
              status: isArchived ? 'active' : 'archived',
            })
          }
        >
          {updateFarm.isPending && <Spinner data-icon='inline-start' />}
          <span>{isArchived ? 'Aktifkan kembali' : 'Arsipkan kebun'}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function FarmerFarmsView() {
  const { data: farms = [], isLoading, isError } = useFarmerFarms()
  const createFarm = useCreateFarmerFarm()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [areaName, setAreaName] = useState('')
  const [fullAddress, setFullAddress] = useState('')
  const [pickupNotes, setPickupNotes] = useState('')

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl font-semibold text-foreground'>Kebun Saya</h1>
          <p className='text-base text-muted-foreground'>
            Kelola titik lahan dan lokasi pengambilan mandiri hasil panen Anda.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus data-icon='inline-start' />
            <span>Tambah kebun</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah kebun baru</DialogTitle>
              <DialogDescription>
                Masukkan lokasi lahan dan catatan akses untuk pengambilan pembeli.
              </DialogDescription>
            </DialogHeader>
            <form
              className='flex flex-col gap-4'
              onSubmit={async (event) => {
                event.preventDefault()
                await createFarm.mutateAsync({
                  name,
                  areaName,
                  fullAddress,
                  primaryCommodities: ['sayuran'],
                  pickupNotes: pickupNotes || undefined,
                })
                setName('')
                setAreaName('')
                setFullAddress('')
                setPickupNotes('')
                setDialogOpen(false)
              }}
            >
              {createFarm.isError && (
                <Alert variant='destructive'>
                  <AlertCircle />
                  <AlertDescription>{createFarm.error.message}</AlertDescription>
                </Alert>
              )}
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor='farm-name'>Nama kebun</FieldLabel>
                  <Input
                    id='farm-name'
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder='Contoh: Kebun Lembang Blok B'
                    required
                    minLength={3}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor='farm-area'>Kecamatan / Kabupaten</FieldLabel>
                  <Input
                    id='farm-area'
                    value={areaName}
                    onChange={(event) => setAreaName(event.target.value)}
                    placeholder='Contoh: Lembang, Bandung Barat'
                    required
                    minLength={3}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor='farm-address'>Alamat lengkap</FieldLabel>
                  <Textarea
                    id='farm-address'
                    rows={2}
                    value={fullAddress}
                    onChange={(event) => setFullAddress(event.target.value)}
                    required
                    minLength={8}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor='farm-notes'>Catatan pengambilan</FieldLabel>
                  <Input
                    id='farm-notes'
                    value={pickupNotes}
                    onChange={(event) => setPickupNotes(event.target.value)}
                    placeholder='Contoh: Akses mobil bak sampai teras gudang'
                  />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button type='submit' disabled={createFarm.isPending}>
                  {createFarm.isPending && <Spinner data-icon='inline-start' />}
                  <span>Simpan kebun</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>Gagal memuat daftar kebun.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Skeleton className='h-44 w-full' />
          <Skeleton className='h-44 w-full' />
        </div>
      ) : farms.length === 0 ? (
        <Empty className='border border-border bg-card'>
          <EmptyHeader>
            <EmptyTitle>Belum ada kebun terdaftar</EmptyTitle>
            <EmptyDescription>
              Tambahkan lokasi kebun pertama Anda untuk memudahkan pengaturan jadwal panen.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {farms.map((farm) => (
            <FarmRowCard key={farm.id} farm={farm} />
          ))}
        </div>
      )}
    </div>
  )
}
