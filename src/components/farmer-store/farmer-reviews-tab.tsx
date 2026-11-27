'use client'

import { useState } from 'react'
import { ListFilter, MessageSquareText, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  getReviewTopicLabel,
  type FarmerReviewFilterState,
  type FarmerReviewSort,
} from '@/lib/data/farmer-store-helpers'
import {
  FarmerReviewTopicSchema,
  type FarmerReview,
  type FarmerReviewTopic,
  type FarmerReviewsSummary,
} from '@/types/api/farmers'
import { FarmerReviewCard } from './farmer-review-card'

interface FarmerReviewsTabProps {
  farmName: string
  summary: FarmerReviewsSummary
  reviews: ReadonlyArray<FarmerReview>
  filters: FarmerReviewFilterState
  helpfulPendingId: string | null
  onToggleWithPhoto: (checked: boolean) => void
  onToggleRating: (stars: number) => void
  onToggleTopic: (topic: FarmerReviewTopic) => void
  onSortChange: (sort: FarmerReviewSort) => void
  onResetFilters: () => void
  onToggleHelpful: (reviewId: string) => void
}

const reviewSortLabels: Record<FarmerReviewSort, string> = {
  terbaru: 'Terbaru',
  'rating-tinggi': 'Rating tertinggi',
  'rating-rendah': 'Rating terendah',
  membantu: 'Paling membantu',
}

function ReviewFilterControls({
  idPrefix,
  filters,
  summary,
  onToggleWithPhoto,
  onToggleRating,
  onToggleTopic,
}: {
  idPrefix: string
  filters: FarmerReviewFilterState
  summary: FarmerReviewsSummary
  onToggleWithPhoto: (checked: boolean) => void
  onToggleRating: (stars: number) => void
  onToggleTopic: (topic: FarmerReviewTopic) => void
}) {
  return (
    <div className='flex flex-col gap-5'>
      <FieldSet>
        <FieldLegend variant='label'>Media</FieldLegend>
        <FieldGroup className='gap-2.5'>
          <Field orientation='horizontal'>
            <Checkbox
              id={`${idPrefix}-with-photo`}
              checked={filters.withPhotoOnly}
              onCheckedChange={(checked) => onToggleWithPhoto(Boolean(checked))}
            />
            <FieldLabel htmlFor={`${idPrefix}-with-photo`} className='font-normal'>
              Dengan foto
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet className='pt-2'>
        <FieldLegend variant='label'>Rating</FieldLegend>
        <FieldGroup className='gap-2.5'>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.breakdown.find((item) => item.stars === stars)?.count ?? 0
            const checked = filters.ratings.includes(stars)
            return (
              <Field key={stars} orientation='horizontal'>
                <Checkbox
                  id={`${idPrefix}-rating-${stars}`}
                  checked={checked}
                  onCheckedChange={() => onToggleRating(stars)}
                />
                <FieldLabel
                  htmlFor={`${idPrefix}-rating-${stars}`}
                  className='flex flex-1 items-center justify-between font-normal'
                >
                  <span className='inline-flex items-center gap-1 tabular-nums'>
                    <Star className='size-3.5 fill-chart-2 text-chart-2' aria-hidden='true' />
                    <span>{stars}</span>
                  </span>
                  <span className='text-xs text-muted-foreground tabular-nums'>({count})</span>
                </FieldLabel>
              </Field>
            )
          })}
        </FieldGroup>
      </FieldSet>

      <FieldSet className='pt-2'>
        <FieldLegend variant='label'>Topik Ulasan</FieldLegend>
        <FieldGroup className='gap-2.5'>
          {FarmerReviewTopicSchema.options.map((topic) => {
            const count = summary.topicCounts.find((item) => item.topic === topic)?.count ?? 0
            const checked = filters.topics.includes(topic)
            return (
              <Field key={topic} orientation='horizontal'>
                <Checkbox
                  id={`${idPrefix}-topic-${topic}`}
                  checked={checked}
                  onCheckedChange={() => onToggleTopic(topic)}
                />
                <FieldLabel
                  htmlFor={`${idPrefix}-topic-${topic}`}
                  className='flex flex-1 items-center justify-between gap-2 font-normal'
                >
                  <span>{getReviewTopicLabel(topic)}</span>
                  <span className='text-xs text-muted-foreground tabular-nums'>({count})</span>
                </FieldLabel>
              </Field>
            )
          })}
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

export function FarmerReviewsTab({
  farmName,
  summary,
  reviews,
  filters,
  helpfulPendingId,
  onToggleWithPhoto,
  onToggleRating,
  onToggleTopic,
  onSortChange,
  onResetFilters,
  onToggleHelpful,
}: FarmerReviewsTabProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const hasActiveFilter =
    filters.withPhotoOnly || filters.ratings.length > 0 || filters.topics.length > 0

  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardContent className='grid grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-[240px_minmax(0,1fr)] md:items-center'>
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-baseline gap-2'>
              <Star className='size-6 self-center fill-chart-2 text-chart-2' aria-hidden='true' />
              <span className='text-4xl font-bold text-foreground tabular-nums'>
                {summary.totalRatings > 0
                  ? summary.averageRating.toFixed(1).replace('.', ',')
                  : '0,0'}
              </span>
              <span className='text-base text-muted-foreground tabular-nums'>/ 5,0</span>
            </div>
            <p className='text-sm font-semibold text-foreground tabular-nums'>
              {summary.satisfactionPercent}% pembeli merasa puas
            </p>
            <p className='text-sm text-muted-foreground tabular-nums'>
              {summary.totalRatings} rating, {summary.totalReviews} ulasan
            </p>
          </div>

          <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-x-8'>
            {summary.breakdown.map((item) => {
              const percent =
                summary.totalRatings > 0 ? Math.round((item.count / summary.totalRatings) * 100) : 0
              return (
                <div key={item.stars} className='flex items-center gap-3'>
                  <span className='inline-flex w-8 shrink-0 items-center gap-1 text-sm font-medium text-foreground tabular-nums'>
                    <Star className='size-3.5 fill-chart-2 text-chart-2' aria-hidden='true' />
                    <span>{item.stars}</span>
                  </span>
                  <Progress
                    value={percent}
                    aria-label={`Rating ${item.stars} bintang`}
                    className='flex-1 gap-0'
                  />
                  <span className='w-10 shrink-0 text-right text-xs text-muted-foreground tabular-nums'>
                    ({item.count})
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8'>
        <aside aria-label='Filter ulasan' className='hidden lg:block'>
          <div className='sticky top-28 rounded-2xl border border-border bg-card p-4'>
            <div className='mb-4 flex items-center justify-between gap-2'>
              <h2 className='type-h4 text-foreground'>Filter Ulasan</h2>
              {hasActiveFilter && (
                <Button type='button' variant='ghost' size='xs' onClick={onResetFilters}>
                  Reset
                </Button>
              )}
            </div>
            <ReviewFilterControls
              idPrefix='desktop-review'
              filters={filters}
              summary={summary}
              onToggleWithPhoto={onToggleWithPhoto}
              onToggleRating={onToggleRating}
              onToggleTopic={onToggleTopic}
            />
          </div>
        </aside>

        <div className='flex min-w-0 flex-col gap-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-2.5'>
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger
                  render={
                    <Button type='button' variant='outline' size='sm' className='lg:hidden' />
                  }
                >
                  <ListFilter data-icon='inline-start' aria-hidden='true' />
                  <span>Filter ulasan</span>
                </SheetTrigger>
                <SheetContent side='left' className='sm:max-w-sm'>
                  <SheetHeader className='px-5 py-4 pr-14'>
                    <SheetTitle>Filter Ulasan</SheetTitle>
                    <SheetDescription>Saring ulasan pembeli untuk {farmName}.</SheetDescription>
                  </SheetHeader>
                  <div className='p-5'>
                    <ReviewFilterControls
                      idPrefix='mobile-review'
                      filters={filters}
                      summary={summary}
                      onToggleWithPhoto={onToggleWithPhoto}
                      onToggleRating={onToggleRating}
                      onToggleTopic={onToggleTopic}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <p className='text-sm text-muted-foreground tabular-nums'>
                Menampilkan {reviews.length} dari {summary.totalReviews} ulasan
              </p>
            </div>

            <Select
              value={filters.sort}
              onValueChange={(value) => {
                if (value) {
                  onSortChange(value as FarmerReviewSort)
                }
              }}
            >
              <SelectTrigger aria-label='Urutkan ulasan' size='sm' className='w-full sm:w-48'>
                <SelectValue>{reviewSortLabels[filters.sort]}</SelectValue>
              </SelectTrigger>
              <SelectContent align='end'>
                <SelectGroup>
                  <SelectItem value='terbaru'>{reviewSortLabels.terbaru}</SelectItem>
                  <SelectItem value='rating-tinggi'>{reviewSortLabels['rating-tinggi']}</SelectItem>
                  <SelectItem value='rating-rendah'>{reviewSortLabels['rating-rendah']}</SelectItem>
                  <SelectItem value='membantu'>{reviewSortLabels.membantu}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {reviews.length === 0 ? (
            <Empty className='border border-border bg-card py-12'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <MessageSquareText />
                </EmptyMedia>
                <EmptyTitle>Belum ada ulasan sesuai filter</EmptyTitle>
                <EmptyDescription>
                  Ubah pilihan rating, media, atau topik untuk melihat ulasan lainnya.
                </EmptyDescription>
              </EmptyHeader>
              {hasActiveFilter && (
                <EmptyContent>
                  <Button type='button' variant='outline' size='sm' onClick={onResetFilters}>
                    Reset filter ulasan
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <ul className='flex flex-col gap-4'>
              {reviews.map((review) => (
                <FarmerReviewCard
                  key={review.id}
                  farmName={farmName}
                  review={review}
                  isHelpfulPending={helpfulPendingId === review.id}
                  onToggleHelpful={onToggleHelpful}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
