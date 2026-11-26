'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Camera, ChevronDown, Star, ThumbsUp } from 'lucide-react'
import { buildOfferDetailHref, formatWeightKg } from '@/components/home/offer-card-helpers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { formatShortDateId, getReviewTopicLabel } from '@/lib/data/farmer-store-helpers'
import { cn } from '@/lib/utils'
import type { FarmerReview } from '@/types/api/farmers'

interface FarmerReviewCardProps {
  farmName: string
  review: FarmerReview
  isHelpfulPending: boolean
  onToggleHelpful: (reviewId: string) => void
}

function ReviewReplyBlock({
  farmName,
  reply,
}: {
  farmName: string
  reply: NonNullable<FarmerReview['farmerReply']>
}) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className='mt-2'>
      <div className='flex justify-end'>
        <CollapsibleTrigger
          render={
            <Button type='button' variant='ghost' size='xs' className='text-muted-foreground' />
          }
        >
          <span>{open ? 'Tutup balasan' : 'Lihat balasan petani'}</span>
          <ChevronDown
            data-icon='inline-end'
            aria-hidden='true'
            className={cn('transition-transform', open && 'rotate-180')}
          />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className='mt-2 flex flex-col gap-1.5 rounded-xl bg-muted/60 p-3.5 text-sm'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-semibold text-foreground'>{farmName}</span>
            <Badge variant='secondary'>Petani</Badge>
            <span className='text-xs text-muted-foreground tabular-nums'>
              {formatShortDateId(reply.repliedAt)}
            </span>
          </div>
          <p className='leading-relaxed text-foreground'>{reply.message}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function FarmerReviewCard({
  farmName,
  review,
  isHelpfulPending,
  onToggleHelpful,
}: FarmerReviewCardProps) {
  const offerHref = buildOfferDetailHref(review.offerId)

  return (
    <li className='rounded-2xl border border-border bg-card p-5 text-card-foreground'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-[220px_minmax(0,1fr)]'>
        <div className='flex items-start gap-3'>
          {review.commodityPhotoUrl ? (
            <div className='relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted'>
              <Image
                src={review.commodityPhotoUrl}
                alt={review.commodityName}
                fill
                sizes='56px'
                className='object-cover'
              />
            </div>
          ) : (
            <div className='flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
              <Camera className='size-5' aria-hidden='true' />
            </div>
          )}
          <div className='flex min-w-0 flex-col gap-1'>
            <Link
              href={offerHref}
              className='line-clamp-2 text-sm font-semibold text-foreground underline-offset-4 hover:underline'
            >
              {review.commodityName}
            </Link>
            <span className='text-xs text-muted-foreground tabular-nums'>
              Pesanan {formatWeightKg(review.quantityKg)}
            </span>
          </div>
        </div>

        <div className='flex min-w-0 flex-col gap-2.5'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div
              className='inline-flex items-center gap-0.5'
              aria-label={`Rating ${review.rating} dari 5 bintang`}
            >
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <Star
                  key={starIndex}
                  aria-hidden='true'
                  className={cn(
                    'size-4',
                    starIndex <= review.rating
                      ? 'fill-chart-2 text-chart-2'
                      : 'text-muted-foreground/35'
                  )}
                />
              ))}
            </div>
            <time
              dateTime={review.createdAt}
              className='text-xs text-muted-foreground tabular-nums'
            >
              {formatShortDateId(review.createdAt)}
            </time>
          </div>

          <p className='text-sm font-semibold text-foreground'>{review.buyerDisplayName}</p>

          <p className='text-sm leading-relaxed text-foreground'>{review.comment}</p>

          {review.topics.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {review.topics.map((topic) => (
                <Badge key={topic} variant='outline' className='text-xs'>
                  {getReviewTopicLabel(topic)}
                </Badge>
              ))}
            </div>
          )}

          {review.photos.length > 0 && (
            <div className='flex flex-wrap gap-2 pt-1'>
              {review.photos.map((photoUrl, idx) => (
                <div
                  key={`${review.id}-photo-${idx}`}
                  className='relative size-16 overflow-hidden rounded-lg border border-border bg-muted'
                >
                  <Image
                    src={photoUrl}
                    alt={`Foto ulasan ${review.commodityName} oleh ${review.buyerDisplayName}`}
                    fill
                    sizes='64px'
                    className='object-cover'
                  />
                </div>
              ))}
            </div>
          )}

          <div className='flex items-center justify-between gap-2 pt-1'>
            <Button
              type='button'
              variant={review.isHelpfulByMe ? 'secondary' : 'ghost'}
              size='xs'
              aria-pressed={Boolean(review.isHelpfulByMe)}
              disabled={isHelpfulPending}
              onClick={() => onToggleHelpful(review.id)}
            >
              <ThumbsUp data-icon='inline-start' aria-hidden='true' />
              <span className='tabular-nums'>Membantu ({review.helpfulCount})</span>
            </Button>
          </div>

          {review.farmerReply && (
            <ReviewReplyBlock farmName={farmName} reply={review.farmerReply} />
          )}
        </div>
      </div>
    </li>
  )
}
