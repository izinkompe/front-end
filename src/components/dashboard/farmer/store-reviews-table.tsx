'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFarmerOwnReviews } from '@/hooks/api/use-farmer-management'
import type { FarmerReview } from '@/types/api/farmers'
import { createFarmerColumnHelper, FarmerDataTable } from './farmer-data-table'
import { ReviewReplySheet } from './review-reply-sheet'

const columnHelper = createFarmerColumnHelper<FarmerReview>()

export function StoreReviewsTable() {
  const { data: reviews = [], isLoading, isError } = useFarmerOwnReviews()
  const [activeReview, setActiveReview] = useState<FarmerReview | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    const total = reviews.reduce((sum, item) => sum + item.rating, 0)
    return Math.round((total / reviews.length) * 10) / 10
  }, [reviews])

  const unrepliedCount = useMemo(
    () => reviews.filter((review) => !review.farmerReply).length,
    [reviews]
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('buyerDisplayName', {
        id: 'buyerDisplayName',
        header: 'Pembeli',
        meta: { label: 'Pembeli' },
        cell: (info) => {
          const review = info.row.original
          return (
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='font-medium text-foreground'>{review.buyerDisplayName}</span>
              <span className='text-meta text-muted-foreground'>
                {new Date(review.createdAt).toLocaleDateString('id-ID')}
              </span>
            </div>
          )
        },
      }),
      columnHelper.accessor('commodityName', {
        header: 'Komoditas',
        meta: { label: 'Komoditas' },
        cell: (info) => {
          const review = info.row.original
          return (
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='text-foreground'>{review.commodityName}</span>
              <span className='font-mono text-meta text-muted-foreground tabular-nums'>
                {review.quantityKg.toLocaleString('id-ID')} kg
              </span>
            </div>
          )
        },
      }),
      columnHelper.accessor('rating', {
        header: 'Nilai',
        meta: { label: 'Nilai', nowrap: true },
        cell: (info) => (
          <Badge variant='outline' className='font-mono tabular-nums'>
            {info.getValue()} / 5
          </Badge>
        ),
      }),
      columnHelper.accessor('comment', {
        header: 'Ulasan',
        meta: { label: 'Ulasan' },
        cell: (info) => {
          const review = info.row.original
          return (
            <div className='flex min-w-0 flex-col gap-1'>
              <p className='text-sm text-foreground'>{review.comment}</p>
              {review.farmerReply && (
                <p className='text-meta text-muted-foreground'>
                  Balasan Anda: {review.farmerReply.message}
                </p>
              )}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'replyStatus',
        header: 'Status balasan',
        meta: { label: 'Status balasan', nowrap: true },
        cell: (info) => {
          const replied = Boolean(info.row.original.farmerReply)
          return (
            <Badge variant={replied ? 'default' : 'secondary'}>
              {replied ? 'Sudah dibalas' : 'Belum dibalas'}
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        meta: { label: 'Aksi' },
        cell: (info) => {
          const review = info.row.original
          return (
            <Button
              type='button'
              variant='outline'
              size='icon-sm'
              aria-label={
                review.farmerReply
                  ? `Ubah balasan ulasan ${review.buyerDisplayName}`
                  : `Balas ulasan ${review.buyerDisplayName}`
              }
              title={review.farmerReply ? 'Ubah balasan' : 'Balas ulasan'}
              onClick={() => setActiveReview(review)}
            >
              <MessageSquare aria-hidden='true' />
            </Button>
          )
        },
      }),
    ],
    []
  )

  if (isLoading) {
    return <Skeleton className='h-64 w-full' />
  }

  if (isError) {
    return (
      <Alert variant='destructive'>
        <AlertCircle />
        <AlertDescription>Gagal memuat ulasan pembeli untuk toko ini.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      {savedMessage && (
        <Alert>
          <CheckCircle2 />
          <AlertDescription>{savedMessage}</AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Card className='min-w-0'>
          <CardHeader>
            <CardDescription>Rata-rata penilaian</CardDescription>
            <CardTitle className='type-kpi font-mono tabular-nums'>{averageRating} / 5</CardTitle>
          </CardHeader>
        </Card>
        <Card className='min-w-0'>
          <CardHeader>
            <CardDescription>Total ulasan masuk</CardDescription>
            <CardTitle className='type-kpi font-mono tabular-nums'>{reviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className='min-w-0'>
          <CardHeader>
            <CardDescription>Menunggu balasan</CardDescription>
            <CardTitle className='type-kpi font-mono tabular-nums'>{unrepliedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <FarmerDataTable
        data={reviews}
        columns={columns}
        caption='Daftar ulasan pembeli untuk toko Anda'
        rowHeaderColumnId='buyerDisplayName'
        searchPlaceholder='Cari nama pembeli atau komoditas...'
        searchAriaLabel='Cari ulasan pembeli'
        emptyTitle='Belum ada ulasan pembeli'
        emptyDescription='Ulasan dari pesanan yang sudah selesai akan muncul di sini.'
      />

      <ReviewReplySheet
        review={activeReview}
        onOpenChange={(open) => {
          if (!open) setActiveReview(null)
        }}
        onSaved={() => setSavedMessage('Balasan ulasan berhasil disimpan.')}
      />
    </div>
  )
}
