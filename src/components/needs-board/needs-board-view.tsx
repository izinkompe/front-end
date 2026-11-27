'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import {
  Apple,
  Calendar,
  CalendarOff,
  Carrot,
  CheckCircle2,
  CircleDot,
  Hourglass,
  Layers,
  LayoutGrid,
  Leaf,
  MapPin,
  MessageSquare,
  Plus,
  Wheat,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { BuyerAuthDialog } from '@/components/auth/buyer-auth-dialog'
import { HeroFilterSelect } from '@/components/home/hero-filter-controls'
import { formatPlainRupiah, formatWeightKg } from '@/components/home/offer-card-helpers'
import { CommoditySearchInput } from '@/components/shared/commodity-search-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useHydrated } from '@/hooks/use-hydrated'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useNeedsBoard } from '@/hooks/api/use-needs-board'
import { mainCategories, type BuyerCategorySlug } from '@/lib/data/categories'
import { filterNeeds, isActiveNeed, needStatusLabels } from '@/lib/data/needs-board-helpers'
import type { NeedRequestStatus } from '@/types/api/needs-board'
import { cn } from '@/lib/utils'
import { formatNeedDate, NeedDetailPanel } from './need-detail-panel'
import { NeedRequestFormDialog } from './need-request-form-dialog'

type NeedCategoryFilter = 'all' | BuyerCategorySlug
type NeedStatusFilter = 'all' | NeedRequestStatus

const needCategoryIcons: Record<NeedCategoryFilter, LucideIcon> = {
  all: LayoutGrid,
  sayuran: Leaf,
  buah: Apple,
  'padi-biji': Wheat,
  'rempah-umbi': Carrot,
}

const needStatusIcons: Record<NeedStatusFilter, LucideIcon> = {
  all: Layers,
  open: CircleDot,
  partially_fulfilled: Hourglass,
  fulfilled: CheckCircle2,
  closed: XCircle,
  expired: CalendarOff,
}

const needCategoryOptions: ReadonlyArray<{ value: NeedCategoryFilter; label: string }> = [
  { value: 'all', label: 'Semua kategori' },
  ...mainCategories.map((item) => ({ value: item.slug, label: item.label })),
]

export function NeedsBoardView() {
  const router = useRouter()
  const isHydrated = useHydrated()
  const params = useSearchParams()
  const requestId = params.get('request')
  const { data: user } = useCurrentUser()
  const { data, isPending, isError, refetch } = useNeedsBoard()
  const [authOpen, setAuthOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<NeedCategoryFilter>('all')
  const [status, setStatus] = useState<NeedStatusFilter>('all')

  const isBuyer = isHydrated && user?.role === 'buyer'
  const own = params.get('tab') === 'mine' && isBuyer
  const needStatusOptions: ReadonlyArray<{ value: NeedStatusFilter; label: string }> = [
    { value: 'all', label: 'Semua status' },
    ...(Object.entries(needStatusLabels) as Array<[NeedRequestStatus, string]>)
      .filter(([key]) => own || key === 'open' || key === 'partially_fulfilled')
      .map(([key, label]) => ({ value: key, label })),
  ]
  const selected = isHydrated ? data?.find((need) => need.id === requestId) : undefined
  const needs = filterNeeds(data ?? [], {
    ownerId: own ? user.id : undefined,
    search,
    category: category === 'all' ? '' : category,
    status: status === 'all' ? '' : status,
  })
  const hasFilters = Boolean(search.trim() || category !== 'all' || status !== 'all')

  function href(options: { request?: string; mine?: boolean } = {}) {
    const query = new URLSearchParams()
    if (options.mine ?? own) query.set('tab', 'mine')
    if (options.request) query.set('request', options.request)
    return '/papan-kebutuhan' + (query.size ? '?' + query.toString() : '')
  }

  function resetFilters() {
    setSearch('')
    setCategory('all')
    setStatus('all')
  }

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8'>
      <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='type-h1 text-foreground'>Papan Kebutuhan Pangan</h1>
          <p className='text-base text-muted-foreground'>
            Publikasikan kebutuhan bahan pangan Anda agar petani terdekat dapat menawarkan panennya.
          </p>
        </div>

        <Button
          onClick={() => (isBuyer ? setCreateOpen(true) : setAuthOpen(true))}
          className='shrink-0 self-start sm:self-auto'
        >
          <Plus data-icon='inline-start' aria-hidden='true' />
          <span>Pasang kebutuhan</span>
        </Button>
      </header>

      {isBuyer && (
        <nav aria-label='Daftar permintaan' className='flex flex-wrap gap-2'>
          <Button
            variant={own ? 'outline' : 'secondary'}
            size='sm'
            nativeButton={false}
            render={
              <Link
                href={href({ mine: false })}
                scroll={false}
                aria-current={own ? undefined : 'page'}
              />
            }
            onClick={() => setStatus('all')}
          >
            Permintaan aktif
          </Button>
          <Button
            variant={own ? 'secondary' : 'outline'}
            size='sm'
            nativeButton={false}
            render={
              <Link
                href={href({ mine: true })}
                scroll={false}
                aria-current={own ? 'page' : undefined}
              />
            }
            onClick={() => setStatus('all')}
          >
            Permintaan saya
          </Button>
        </nav>
      )}

      <search className='grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]'>
        <CommoditySearchInput
          id='need-search'
          value={search}
          onChange={setSearch}
          placeholder='Cari komoditas atau wilayah (contoh: Tomat, Bandung)'
          ariaLabel='Cari komoditas atau wilayah'
        />
        <HeroFilterSelect
          id='need-category-filter'
          value={category}
          onValueChange={(value) => setCategory((value as NeedCategoryFilter) ?? 'all')}
          options={needCategoryOptions}
          icons={needCategoryIcons}
          ariaLabel='Pilih kategori komoditas'
          fallbackLabel='Semua kategori'
        />
        <HeroFilterSelect
          id='need-status-filter'
          value={status}
          onValueChange={(value) => setStatus((value as NeedStatusFilter) ?? 'all')}
          options={needStatusOptions}
          icons={needStatusIcons}
          ariaLabel='Pilih status permintaan'
          fallbackLabel='Semua status'
        />
      </search>

      {!isHydrated || isPending ? (
        <Skeleton className='h-40 w-full' />
      ) : isError ? (
        <Alert variant='destructive'>
          <AlertDescription className='flex flex-wrap items-center justify-between gap-3'>
            <span>Permintaan gagal dimuat.</span>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              Muat ulang
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div
          className={
            selected
              ? 'grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]'
              : 'flex flex-col gap-4'
          }
        >
          {requestId && !selected && (
            <Alert>
              <AlertDescription className='flex flex-wrap items-center justify-between gap-3'>
                <span>Permintaan yang dipilih tidak ditemukan atau sudah tidak aktif.</span>
                <Button
                  variant='outline'
                  size='sm'
                  nativeButton={false}
                  render={<Link href={href()} />}
                >
                  Kembali ke daftar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {selected && (
            <div className='order-first min-w-0 lg:order-last lg:sticky lg:top-20'>
              <NeedDetailPanel
                key={selected.id}
                need={selected}
                isOwner={isBuyer && user.id === selected.buyerId}
                closeHref={href()}
              />
            </div>
          )}

          {needs.length ? (
            <ul className={cn('grid min-w-0 gap-3', !selected && 'md:grid-cols-2')}>
              {needs.map((need) => {
                const isSelected = requestId === need.id
                const fulfilledKg = need.fulfilledQuantityKg ?? 0
                const progress =
                  need.neededQuantityKg > 0
                    ? Math.min(100, Math.round((fulfilledKg / need.neededQuantityKg) * 100))
                    : 0
                const responseCount = need.responses?.length ?? 0

                return (
                  <li key={need.id}>
                    <Link
                      href={href({ request: need.id })}
                      scroll={false}
                      aria-current={isSelected ? 'true' : undefined}
                      className='block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
                    >
                      <Card
                        className={cn(
                          'h-full transition-colors hover:border-primary/50 hover:bg-muted/30',
                          isSelected && 'border-primary bg-primary/5'
                        )}
                      >
                        <CardContent className='flex flex-col gap-3 p-4'>
                          <div className='flex flex-wrap items-center justify-between gap-2'>
                            <Badge variant='outline'>{need.category}</Badge>
                            <Badge variant={isActiveNeed(need) ? 'secondary' : 'outline'}>
                              {needStatusLabels[need.status]}
                            </Badge>
                          </div>

                          <div className='flex flex-col gap-1'>
                            <h2 className='text-base font-semibold text-foreground wrap-anywhere'>
                              {need.commodityName}
                            </h2>
                            <p className='text-sm text-muted-foreground'>
                              {need.organization || need.buyerName}
                            </p>
                          </div>

                          <div className='flex flex-wrap items-baseline justify-between gap-2 text-sm tabular-nums'>
                            <span className='font-semibold text-foreground'>
                              {formatWeightKg(need.neededQuantityKg)}
                            </span>
                            {need.maxPricePerKg !== undefined && (
                              <span className='text-muted-foreground'>
                                Maks. {formatPlainRupiah(need.maxPricePerKg)}/kg
                              </span>
                            )}
                          </div>

                          {fulfilledKg > 0 && (
                            <div className='flex flex-col gap-1'>
                              <div className='flex items-center justify-between text-sm text-muted-foreground tabular-nums'>
                                <span>Terpenuhi {formatWeightKg(fulfilledKg)}</span>
                                <span>{progress}%</span>
                              </div>
                              <Progress value={progress} aria-label='Progres pemenuhan' />
                            </div>
                          )}

                          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground'>
                            <span className='inline-flex items-center gap-1'>
                              <MapPin className='icon-sm' aria-hidden='true' />
                              <span>{need.targetArea}</span>
                            </span>
                            <span className='inline-flex items-center gap-1 tabular-nums'>
                              <Calendar className='icon-sm' aria-hidden='true' />
                              <span>{formatNeedDate(need.targetDate)}</span>
                            </span>
                            <span className='inline-flex items-center gap-1 tabular-nums'>
                              <MessageSquare className='icon-sm' aria-hidden='true' />
                              <span>{responseCount} tanggapan</span>
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>
                  {hasFilters
                    ? 'Tidak ada permintaan yang cocok dengan filter'
                    : own
                      ? 'Anda belum memasang kebutuhan pangan'
                      : 'Belum ada permintaan aktif saat ini'}
                </EmptyTitle>
                <EmptyDescription>
                  {hasFilters
                    ? 'Coba ubah kata kunci, kategori, atau status untuk melihat permintaan lain.'
                    : 'Pasang kebutuhan pangan agar petani terdekat dapat menawarkan hasil panen mereka.'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className='flex-row flex-wrap justify-center'>
                {hasFilters ? (
                  <Button variant='outline' onClick={resetFilters}>
                    Atur ulang filter
                  </Button>
                ) : (
                  <Button onClick={() => (isBuyer ? setCreateOpen(true) : setAuthOpen(true))}>
                    Pasang kebutuhan pangan
                  </Button>
                )}
              </EmptyContent>
            </Empty>
          )}
        </div>
      )}

      <BuyerAuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onAuthenticated={() => setCreateOpen(true)}
      />

      {isBuyer && (
        <NeedRequestFormDialog
          key={String(createOpen)}
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(id) => {
            resetFilters()
            router.push(href({ mine: true, request: id }))
          }}
        />
      )}
    </div>
  )
}
