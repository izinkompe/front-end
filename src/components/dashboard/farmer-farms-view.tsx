'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArchiveRestore, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { DashboardFilterSelect } from './dashboard-filter-select'
import { DashboardPageHeader } from './dashboard-page-header'
import {
  useFarmerFarms,
  useFarmerOffers,
  useUpdateFarmerFarm,
} from '@/hooks/api/use-farmer-management'
import type { FarmerFarm, FarmerFarmStatus } from '@/types/api/farmer-management'
import { createFarmerColumnHelper, FarmerDataTable } from './farmer/farmer-data-table'

const columnHelper = createFarmerColumnHelper<FarmerFarm>()

function ArchiveFarmDialog({
  farm,
  onOpenChange,
  onSuccess,
}: {
  farm: FarmerFarm | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const updateFarm = useUpdateFarmerFarm(farm?.id ?? '')
  if (!farm) return null

  const isArchived = farm.status === 'archived'
  const nextStatus: FarmerFarmStatus = isArchived ? 'active' : 'archived'

  return (
    <AlertDialog open={Boolean(farm)} onOpenChange={onOpenChange}>
      <AlertDialogContent className='max-h-[90dvh] overflow-y-auto'>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArchived ? 'Aktifkan kembali kebun ini?' : 'Arsipkan kebun ini?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchived
              ? `${farm.name} akan kembali tersedia saat membuat penawaran panen baru.`
              : `${farm.name} tidak dapat dipilih untuk penawaran baru, sementara riwayat pesanan tetap tersimpan.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {updateFarm.isError && (
          <Alert variant='destructive'>
            <AlertCircle />
            <AlertDescription>{updateFarm.error.message}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant={isArchived ? 'default' : 'destructive'}
            disabled={updateFarm.isPending}
            onClick={() =>
              updateFarm.mutate(
                {
                  name: farm.name,
                  areaName: farm.areaName,
                  fullAddress: farm.fullAddress,
                  latitude: farm.latitude,
                  longitude: farm.longitude,
                  primaryCommodities:
                    farm.primaryCommodities.length > 0 ? farm.primaryCommodities : ['sayuran'],
                  pickupNotes: farm.pickupNotes,
                  status: nextStatus,
                },
                {
                  onSuccess: () => {
                    onSuccess()
                    onOpenChange(false)
                  },
                }
              )
            }
          >
            {updateFarm.isPending && <Spinner data-icon='inline-start' />}
            <span>{isArchived ? 'Aktifkan kebun' : 'Arsipkan kebun'}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function FarmerFarmsView() {
  const { data: farms = [], isLoading, isError } = useFarmerFarms()
  const { data: offers = [] } = useFarmerOffers()
  const [statusFilter, setStatusFilter] = useState<'all' | FarmerFarmStatus>('all')
  const [archiveTarget, setArchiveTarget] = useState<FarmerFarm | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const filteredFarms = useMemo(
    () => (statusFilter === 'all' ? farms : farms.filter((farm) => farm.status === statusFilter)),
    [farms, statusFilter]
  )

  const activeOfferCountByFarm = useMemo(() => {
    const counts = new Map<string, number>()
    for (const farm of farms) {
      const count = offers.filter(
        (offer) =>
          offer.status === 'active' &&
          (offer.farmId === farm.id || (!offer.farmId && offer.pickupAddressArea === farm.areaName))
      ).length
      counts.set(farm.id, count)
    }
    return counts
  }, [farms, offers])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Nama kebun',
        meta: { label: 'Nama kebun' },
        cell: (info) => {
          const farm = info.row.original
          return (
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='font-medium text-foreground'>{farm.name}</span>
              <span className='text-meta text-muted-foreground'>{farm.fullAddress}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor('areaName', {
        header: 'Wilayah',
        meta: { label: 'Wilayah' },
        cell: (info) => {
          const farm = info.row.original
          return (
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='inline-flex items-center gap-1.5 text-foreground'>
                <MapPin className='icon-sm text-muted-foreground' aria-hidden='true' />
                <span>{farm.areaName}</span>
              </span>
              {farm.latitude !== undefined && farm.longitude !== undefined && (
                <span className='font-mono text-meta text-muted-foreground tabular-nums'>
                  {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
                </span>
              )}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'commodities',
        header: 'Komoditas utama',
        meta: { label: 'Komoditas utama' },
        cell: (info) => (
          <div className='flex flex-wrap gap-1'>
            {info.row.original.primaryCommodities.map((item) => (
              <Badge key={item} variant='outline'>
                {item}
              </Badge>
            ))}
          </div>
        ),
      }),
      columnHelper.accessor('pickupNotes', {
        header: 'Catatan ambil',
        meta: { label: 'Catatan ambil' },
        cell: (info) => (
          <span className='text-sm text-muted-foreground'>{info.getValue() || '-'}</span>
        ),
      }),
      columnHelper.display({
        id: 'linkedOffers',
        header: 'Penawaran aktif',
        meta: { label: 'Penawaran aktif', nowrap: true, align: 'end' },
        cell: (info) => (
          <span className='font-mono tabular-nums'>
            {activeOfferCountByFarm.get(info.row.original.id) ?? 0}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        meta: { label: 'Status', nowrap: true },
        cell: (info) => {
          const isArchived = info.getValue() === 'archived'
          return (
            <Badge variant={isArchived ? 'secondary' : 'default'}>
              {isArchived ? 'Diarsipkan' : 'Aktif'}
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        meta: { label: 'Aksi' },
        cell: (info) => {
          const farm = info.row.original
          const isArchived = farm.status === 'archived'
          return (
            <div className='flex items-center gap-1.5'>
              <Button
                variant='outline'
                size='icon-sm'
                nativeButton={false}
                aria-label={`Sunting ${farm.name}`}
                title='Sunting'
                render={<Link href={`/dashboard/kebun/${encodeURIComponent(farm.id)}`} />}
              >
                <Pencil aria-hidden='true' />
              </Button>
              <Button
                type='button'
                variant='outline'
                size='icon-sm'
                aria-label={isArchived ? `Aktifkan ${farm.name}` : `Arsipkan ${farm.name}`}
                title={isArchived ? 'Aktifkan' : 'Arsipkan'}
                className={!isArchived ? 'text-destructive hover:text-destructive' : undefined}
                onClick={() => {
                  setNotice(null)
                  setArchiveTarget(farm)
                }}
              >
                {isArchived ? <ArchiveRestore aria-hidden='true' /> : <Trash2 aria-hidden='true' />}
              </Button>
            </div>
          )
        },
      }),
    ],
    [activeOfferCountByFarm]
  )

  return (
    <div className='flex flex-col gap-6'>
      <DashboardPageHeader
        title='Kebun Saya'
        actions={
          <Button nativeButton={false} render={<Link href='/dashboard/kebun/baru' />}>
            <Plus data-icon='inline-start' aria-hidden='true' />
            <span>Tambah kebun</span>
          </Button>
        }
      />

      {notice && (
        <Alert>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      {isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>Gagal memuat daftar kebun.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Skeleton className='h-72 w-full' />
      ) : (
        <FarmerDataTable
          data={filteredFarms}
          columns={columns}
          caption='Daftar kebun dan titik pengambilan milik toko'
          rowHeaderColumnId='name'
          searchPlaceholder='Cari nama kebun atau wilayah...'
          searchAriaLabel='Cari kebun'
          filterSlot={
            <DashboardFilterSelect
              ariaLabel='Filter status kebun'
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={[
                { value: 'all', label: `Semua status (${farms.length})` },
                { value: 'active', label: 'Aktif' },
                { value: 'archived', label: 'Diarsipkan' },
              ]}
            />
          }
          emptyTitle='Belum ada kebun pada filter ini'
          emptyDescription='Tambahkan kebun pertama Anda untuk menentukan lokasi pengambilan panen.'
          emptyAction={
            <Button nativeButton={false} render={<Link href='/dashboard/kebun/baru' />}>
              Tambah kebun
            </Button>
          }
        />
      )}

      <ArchiveFarmDialog
        key={archiveTarget?.id ?? 'none'}
        farm={archiveTarget}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null)
        }}
        onSuccess={() => setNotice('Status kebun berhasil diperbarui.')}
      />
    </div>
  )
}
