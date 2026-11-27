'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, CheckCircle2, MessageSquarePlus, Pencil } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useFarmerStoreSettings } from '@/hooks/api/use-farmer-management'
import { useNeedsBoard } from '@/hooks/api/use-needs-board'
import { mainCategories, matchesOfferCategory, type BuyerCategorySlug } from '@/lib/data/categories'
import { getRemainingNeedKg, isActiveNeed, needStatusLabels } from '@/lib/data/needs-board-helpers'
import type { NeedRequest, NeedResponse } from '@/types/api/needs-board'
import { DashboardFilterSelect } from './dashboard-filter-select'
import { DashboardPageHeader } from './dashboard-page-header'
import { createFarmerColumnHelper, FarmerDataTable } from './farmer/farmer-data-table'
import { FarmerVerificationBanner } from './farmer/farmer-verification-banner'
import { NeedResponseSheet } from './farmer/need-response-sheet'

const needColumnHelper = createFarmerColumnHelper<NeedRequest>()

interface FarmerResponseRow {
  need: NeedRequest
  response: NeedResponse
}

const myResponseColumnHelper = createFarmerColumnHelper<FarmerResponseRow>()

export function FarmerNeedsBoardView() {
  const searchParams = useSearchParams()
  const initialRequestId = searchParams.get('request')
  const { data: user } = useCurrentUser()
  const { data: store } = useFarmerStoreSettings()
  const { data: needs = [], isLoading, isError } = useNeedsBoard()

  const [categoryFilter, setCategoryFilter] = useState<'all' | BuyerCategorySlug>('all')
  const [matchStoreOnly, setMatchStoreOnly] = useState(false)
  const [activeNeedId, setActiveNeedId] = useState<string | null>(initialRequestId)
  const [notice, setNotice] = useState<string | null>(null)

  const farmerId = user?.id
  const isVerified = Boolean(user?.isVerifiedFarmer)
  const storeCommodities = useMemo(
    () => store?.primaryCommodities ?? user?.primaryCommodities ?? [],
    [store?.primaryCommodities, user?.primaryCommodities]
  )

  const filteredNeeds = useMemo(
    () =>
      needs.filter((need) => {
        if (!isActiveNeed(need)) return false
        if (categoryFilter !== 'all' && !matchesOfferCategory(need.category, categoryFilter)) {
          return false
        }
        if (
          matchStoreOnly &&
          storeCommodities.length > 0 &&
          !storeCommodities.some((slug) => matchesOfferCategory(need.category, slug))
        ) {
          return false
        }
        return true
      }),
    [categoryFilter, matchStoreOnly, needs, storeCommodities]
  )

  const myResponses = useMemo<FarmerResponseRow[]>(() => {
    if (!farmerId) return []
    const rows: FarmerResponseRow[] = []
    for (const need of needs) {
      for (const response of need.responses ?? []) {
        if (response.farmerId === farmerId) {
          rows.push({ need, response })
        }
      }
    }
    return rows
  }, [farmerId, needs])

  const selectedNeed = useMemo(
    () => needs.find((item) => item.id === activeNeedId) ?? null,
    [activeNeedId, needs]
  )

  const selectedExistingResponse = useMemo(
    () =>
      selectedNeed && farmerId
        ? (selectedNeed.responses ?? []).find((item) => item.farmerId === farmerId)
        : undefined,
    [farmerId, selectedNeed]
  )

  const needColumns = useMemo(
    () => [
      needColumnHelper.accessor('commodityName', {
        id: 'commodityName',
        header: 'Komoditas & Pembeli',
        meta: { label: 'Komoditas & Pembeli' },
        cell: (info) => {
          const need = info.row.original
          return (
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='font-medium text-foreground'>{need.commodityName}</span>
              <span className='text-meta text-muted-foreground'>
                {need.organization || need.buyerName}
              </span>
            </div>
          )
        },
      }),
      needColumnHelper.accessor('category', {
        header: 'Kategori',
        meta: { label: 'Kategori', nowrap: true },
      }),
      needColumnHelper.accessor('neededQuantityKg', {
        header: 'Kebutuhan (kg)',
        meta: { label: 'Kebutuhan (kg)', nowrap: true, align: 'end' },
        cell: (info) => {
          const need = info.row.original
          const remaining = getRemainingNeedKg(need)
          return (
            <div className='flex flex-col items-end gap-0.5 font-mono tabular-nums'>
              <span className='font-semibold text-foreground'>
                Sisa {remaining.toLocaleString('id-ID')} kg
              </span>
              <span className='text-meta text-muted-foreground'>
                Total {need.neededQuantityKg.toLocaleString('id-ID')} kg
              </span>
            </div>
          )
        },
      }),
      needColumnHelper.accessor((row) => row.maxPricePerKg ?? 0, {
        id: 'maxPrice',
        header: 'Maks. harga/kg',
        meta: { label: 'Maks. harga/kg', nowrap: true, align: 'end' },
        cell: (info) => {
          const val = info.row.original.maxPricePerKg
          return (
            <span className='font-mono tabular-nums'>
              {val ? `Rp ${val.toLocaleString('id-ID')}` : 'Fleksibel'}
            </span>
          )
        },
      }),
      needColumnHelper.accessor('targetDate', {
        header: 'Wilayah & Tanggal',
        meta: { label: 'Wilayah & Tanggal' },
        cell: (info) => {
          const need = info.row.original
          return (
            <div className='flex flex-col gap-0.5'>
              <span className='text-foreground'>{need.targetArea}</span>
              <span className='text-meta text-muted-foreground tabular-nums'>
                Butuh {need.targetDate}
              </span>
            </div>
          )
        },
      }),
      needColumnHelper.accessor('status', {
        header: 'Status',
        meta: { label: 'Status' },
        cell: (info) => {
          const need = info.row.original
          const responded = Boolean(
            farmerId && (need.responses ?? []).some((item) => item.farmerId === farmerId)
          )
          return (
            <div className='flex flex-col gap-1'>
              <Badge variant='secondary'>{needStatusLabels[need.status]}</Badge>
              <span className='text-meta text-muted-foreground'>
                {responded ? 'Sudah ditanggapi' : `${need.responses?.length ?? 0} tanggapan masuk`}
              </span>
            </div>
          )
        },
      }),
      needColumnHelper.display({
        id: 'actions',
        header: 'Aksi',
        meta: { label: 'Aksi' },
        cell: (info) => {
          const need = info.row.original
          const responded = Boolean(
            farmerId && (need.responses ?? []).some((item) => item.farmerId === farmerId)
          )
          return (
            <Button
              type='button'
              variant={responded ? 'outline' : 'default'}
              size='icon-sm'
              aria-label={
                responded
                  ? `Ubah tanggapan ${need.commodityName}`
                  : `Tanggapi ${need.commodityName}`
              }
              title={responded ? 'Ubah tanggapan' : 'Tanggapi'}
              onClick={() => setActiveNeedId(need.id)}
            >
              {responded ? <Pencil aria-hidden='true' /> : <MessageSquarePlus aria-hidden='true' />}
            </Button>
          )
        },
      }),
    ],
    [farmerId]
  )

  const responseColumns = useMemo(
    () => [
      myResponseColumnHelper.accessor((row) => row.need.commodityName, {
        id: 'commodityName',
        header: 'Permintaan pembeli',
        meta: { label: 'Permintaan pembeli' },
        cell: (info) => {
          const { need } = info.row.original
          return (
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='font-medium text-foreground'>{need.commodityName}</span>
              <span className='text-meta text-muted-foreground'>
                {need.organization || need.buyerName} · {need.targetArea}
              </span>
            </div>
          )
        },
      }),
      myResponseColumnHelper.accessor((row) => row.response.offeredQuantityKg, {
        id: 'offeredQuantityKg',
        header: 'Jumlah ditawarkan',
        meta: { label: 'Jumlah ditawarkan', nowrap: true, align: 'end' },
        cell: (info) => (
          <span className='font-mono font-medium tabular-nums'>
            {info.getValue().toLocaleString('id-ID')} kg
          </span>
        ),
      }),
      myResponseColumnHelper.accessor((row) => row.response.offeredPricePerKg, {
        id: 'offeredPricePerKg',
        header: 'Harga/kg',
        meta: { label: 'Harga/kg', nowrap: true, align: 'end' },
        cell: (info) => (
          <span className='font-mono font-medium tabular-nums'>
            Rp {info.getValue().toLocaleString('id-ID')}
          </span>
        ),
      }),
      myResponseColumnHelper.accessor((row) => row.response.availableDate, {
        id: 'availableDate',
        header: 'Siap diambil',
        meta: { label: 'Siap diambil', nowrap: true },
      }),
      myResponseColumnHelper.accessor((row) => row.need.status, {
        id: 'needStatus',
        header: 'Status permintaan',
        meta: { label: 'Status permintaan', nowrap: true },
        cell: (info) => (
          <Badge variant={isActiveNeed(info.row.original.need) ? 'default' : 'secondary'}>
            {needStatusLabels[info.getValue()]}
          </Badge>
        ),
      }),
      myResponseColumnHelper.display({
        id: 'responseActions',
        header: 'Aksi',
        meta: { label: 'Aksi' },
        cell: (info) => {
          const { need } = info.row.original
          return (
            <Button
              type='button'
              variant='outline'
              size='icon-sm'
              disabled={!isActiveNeed(need)}
              aria-label={`Kelola tanggapan ${need.commodityName}`}
              title='Kelola'
              onClick={() => setActiveNeedId(need.id)}
            >
              <Pencil aria-hidden='true' />
            </Button>
          )
        },
      }),
    ],
    []
  )

  return (
    <div className='flex flex-col gap-6'>
      <DashboardPageHeader title='Papan Kebutuhan' />

      <FarmerVerificationBanner isVerified={isVerified} context='needs-board' />

      {notice && (
        <Alert role='status' aria-live='polite'>
          <CheckCircle2 />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      {isError && (
        <Alert variant='destructive'>
          <AlertCircle />
          <AlertDescription>Gagal memuat daftar Papan Kebutuhan pembeli.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Skeleton className='h-80 w-full' />
      ) : (
        <Tabs defaultValue='requests' className='flex flex-col gap-4'>
          <TabsList className='scroll-strip max-w-full justify-start'>
            <TabsTrigger value='requests'>Permintaan aktif ({filteredNeeds.length})</TabsTrigger>
            <TabsTrigger value='responses'>Tanggapan saya ({myResponses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value='requests'>
            <FarmerDataTable
              data={filteredNeeds}
              columns={needColumns}
              caption='Daftar permintaan kebutuhan pangan dari pembeli'
              rowHeaderColumnId='commodityName'
              searchPlaceholder='Cari komoditas atau wilayah pembeli...'
              searchAriaLabel='Cari permintaan Papan Kebutuhan'
              filterSlot={
                <div className='flex w-full items-center gap-2 sm:w-auto'>
                  <DashboardFilterSelect
                    ariaLabel='Filter kategori kebutuhan'
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                    className='min-w-0 flex-1 sm:w-48 sm:flex-none'
                    options={[
                      { value: 'all', label: 'Semua kategori' },
                      ...mainCategories.map((cat) => ({
                        value: cat.slug,
                        label: cat.shortLabel,
                      })),
                    ]}
                  />
                  {storeCommodities.length > 0 && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      aria-pressed={matchStoreOnly}
                      className={
                        matchStoreOnly
                          ? 'shrink-0 border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                          : 'shrink-0'
                      }
                      onClick={() => setMatchStoreOnly((prev) => !prev)}
                    >
                      Sesuai komoditas toko
                    </Button>
                  )}
                </div>
              }
              emptyTitle='Tidak ada permintaan kebutuhan yang cocok'
              emptyDescription='Ubah filter kategori atau matikan filter komoditas toko untuk melihat permintaan lain.'
            />
          </TabsContent>

          <TabsContent value='responses'>
            <FarmerDataTable
              data={myResponses}
              columns={responseColumns}
              caption='Daftar tanggapan petani pada Papan Kebutuhan'
              rowHeaderColumnId='commodityName'
              searchPlaceholder='Cari komoditas atau pembeli...'
              searchAriaLabel='Cari tanggapan saya'
              emptyTitle='Belum ada tanggapan dikirim'
              emptyDescription='Tanggapi permintaan aktif pembeli dari tab Permintaan aktif.'
            />
          </TabsContent>
        </Tabs>
      )}

      <NeedResponseSheet
        need={selectedNeed}
        existingResponse={selectedExistingResponse}
        isVerified={isVerified}
        onOpenChange={(open) => {
          if (!open) setActiveNeedId(null)
        }}
        onSaved={setNotice}
      />
    </div>
  )
}
