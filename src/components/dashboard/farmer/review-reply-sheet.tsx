'use client'

import { useForm } from '@tanstack/react-form'
import { AlertCircle } from 'lucide-react'
import { getFieldErrorMessages } from '@/components/auth/farmer/farmer-form-helpers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useReplyFarmerReview } from '@/hooks/api/use-farmer-management'
import { ReplyFarmerReviewRequestSchema } from '@/types/api/farmer-management'
import type { FarmerReview } from '@/types/api/farmers'

interface ReviewReplySheetProps {
  review: FarmerReview | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

function ReviewReplyForm({
  review,
  onSaved,
  onCancel,
}: {
  review: FarmerReview
  onSaved: () => void
  onCancel: () => void
}) {
  const replyMutation = useReplyFarmerReview(review.id)

  const form = useForm({
    defaultValues: {
      message: review.farmerReply?.message ?? '',
    },
    validators: {
      onSubmit: ReplyFarmerReviewRequestSchema,
    },
    onSubmit: async ({ value }) => {
      await replyMutation.mutateAsync({ message: value.message.trim() })
      onSaved()
    },
  })

  return (
    <form
      noValidate
      className='flex flex-1 flex-col justify-between gap-6 p-4'
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div className='flex flex-col gap-4'>
        <Card size='sm' className='bg-muted/40'>
          <CardContent className='flex flex-col gap-1'>
            <p className='text-sm font-semibold text-foreground'>
              {review.buyerDisplayName} · {review.rating}/5
            </p>
            <p className='text-meta text-muted-foreground'>{review.commodityName}</p>
            <p className='pt-1 text-sm text-foreground'>{review.comment}</p>
          </CardContent>
        </Card>

        {replyMutation.isError && (
          <Alert variant='destructive'>
            <AlertCircle />
            <AlertDescription>{replyMutation.error.message}</AlertDescription>
          </Alert>
        )}

        <FieldGroup>
          <form.Field name='message'>
            {(field) => {
              const errors = getFieldErrorMessages(field.state.meta.errors)
              const isInvalid = field.state.meta.isTouched && errors.length > 0
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor='review-reply-message'>Balasan toko</FieldLabel>
                  <Textarea
                    id='review-reply-message'
                    name={field.name}
                    rows={4}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    maxLength={500}
                    aria-invalid={isInvalid || undefined}
                  />
                  <FieldDescription>
                    Maksimal 500 karakter, tampil pada halaman ulasan toko publik.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={errors} />}
                </Field>
              )
            }}
          </form.Field>
        </FieldGroup>
      </div>

      <SheetFooter className='border-t border-border px-0 pt-4 pb-0'>
        <div className='flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Batal
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type='submit' disabled={isSubmitting || replyMutation.isPending}>
                {(isSubmitting || replyMutation.isPending) && <Spinner data-icon='inline-start' />}
                <span>Simpan balasan</span>
              </Button>
            )}
          </form.Subscribe>
        </div>
      </SheetFooter>
    </form>
  )
}

export function ReviewReplySheet({ review, onOpenChange, onSaved }: ReviewReplySheetProps) {
  return (
    <Sheet open={Boolean(review)} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Balas ulasan pembeli</SheetTitle>
        </SheetHeader>
        {review && (
          <ReviewReplyForm
            key={review.id}
            review={review}
            onSaved={() => {
              onSaved()
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
