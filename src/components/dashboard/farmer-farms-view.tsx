'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, MapPin, Plus } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateFarmerFarm,
  useFarmerFarms,
  useUpdateFarmerFarm,
} from '@/hooks/api/use-farmer-management'
import type { CommodityCategory } from '@/types/api/auth'
import {
  CreateFarmerFarmRequestSchema,
  type CreateFarmerFarmRequest,
  type FarmerFarm,
} from '@/types/api/farmer-management'

function FarmRowCard({ farm }: { farm: FarmerFarm }) {
  const updateFarm = useUpdateFarmerFarm(farm.id)
  const isArchived = farm.status === 'archived'

  return (
    <Card className='min-w-0'>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex min-w-0 flex-col gap-1'>
            <CardTitle>{farm.name}</CardTitle>
            <CardDescription className='flex items-center gap-1.5'>
              <MapPin className='icon-sm' aria-hidden='true' />
              <span className='truncate'>{farm.areaName}</span>
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

  const form = useForm({
    defaultValues: {
      name: '',
      areaName: '',
      fullAddress: '',
      primaryCommodities: ['sayuran'] as CommodityCategory[],
      pickupNotes: '',
    } as CreateFarmerFarmRequest,
    validators: {
      onSubmit: CreateFarmerFarmRequestSchema,
    },
    onSubmit: async ({ value }) => {
      await createFarm.mutateAsync({
        name: value.name.trim(),
        areaName: value.areaName.trim(),
        fullAddress: value.fullAddress.trim(),
        primaryCommodities: value.primaryCommodities,
        pickupNotes: value.pickupNotes?.trim() || undefined,
      })
      form.reset()
      setDialogOpen(false)
    },
  })

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='type-h1 font-semibold text-foreground'>Kebun Saya</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className='w-full sm:w-auto' />}>
            <Plus data-icon='inline-start' />
            <span>Tambah kebun</span>
          </DialogTrigger>
          <DialogContent className='max-h-[90dvh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Tambah kebun baru</DialogTitle>
            </DialogHeader>
            <form
              noValidate
              className='flex flex-col gap-4'
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void form.handleSubmit()
              }}
            >
              {createFarm.isError && (
                <Alert variant='destructive'>
                  <AlertCircle />
                  <AlertDescription>{createFarm.error.message}</AlertDescription>
                </Alert>
              )}
              <FieldGroup>
                <form.Field name='name'>
                  {(field) => {
                    const errors = getFieldErrorMessages(field.state.meta.errors)
                    const isInvalid = field.state.meta.isTouched && errors.length > 0
                    return (
                      <Field data-invalid={isInvalid || undefined}>
                        <FieldLabel htmlFor='farm-name'>Nama kebun</FieldLabel>
                        <Input
                          id='farm-name'
                          name={field.name}
                          value={field.state.value ?? ''}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          placeholder='Contoh: Kebun Lembang Blok B'
                          aria-invalid={isInvalid || undefined}
                        />
                        {isInvalid && <FieldError errors={errors} />}
                      </Field>
                    )
                  }}
                </form.Field>
                <form.Field name='areaName'>
                  {(field) => {
                    const errors = getFieldErrorMessages(field.state.meta.errors)
                    const isInvalid = field.state.meta.isTouched && errors.length > 0
                    return (
                      <Field data-invalid={isInvalid || undefined}>
                        <FieldLabel htmlFor='farm-area'>Kecamatan / Kabupaten</FieldLabel>
                        <Input
                          id='farm-area'
                          name={field.name}
                          value={field.state.value ?? ''}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          placeholder='Contoh: Lembang, Bandung Barat'
                          aria-invalid={isInvalid || undefined}
                        />
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
                        <FieldLabel htmlFor='farm-address'>Alamat lengkap</FieldLabel>
                        <Textarea
                          id='farm-address'
                          name={field.name}
                          rows={2}
                          value={field.state.value ?? ''}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          aria-invalid={isInvalid || undefined}
                        />
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
                        <FieldLabel htmlFor='farm-notes'>Catatan pengambilan</FieldLabel>
                        <Input
                          id='farm-notes'
                          name={field.name}
                          value={field.state.value ?? ''}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          placeholder='Contoh: Akses mobil bak sampai teras gudang'
                          aria-invalid={isInvalid || undefined}
                        />
                        {isInvalid && <FieldError errors={errors} />}
                      </Field>
                    )
                  }}
                </form.Field>
              </FieldGroup>
              <DialogFooter>
                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button type='submit' disabled={isSubmitting || createFarm.isPending}>
                      {(isSubmitting || createFarm.isPending) && (
                        <Spinner data-icon='inline-start' />
                      )}
                      <span>Simpan kebun</span>
                    </Button>
                  )}
                </form.Subscribe>
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
