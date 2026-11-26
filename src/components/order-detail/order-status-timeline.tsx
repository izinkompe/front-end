import { Check, Circle, X } from 'lucide-react'
import type { OrderTimelineStep } from '@/lib/data/checkout-helpers'
import { formatDateTimeId } from '@/lib/data/offer-detail-helpers'
import { cn } from '@/lib/utils'

interface OrderStatusTimelineProps {
  steps: ReadonlyArray<OrderTimelineStep>
}

export function OrderStatusTimeline({ steps }: OrderStatusTimelineProps) {
  return (
    <ol aria-label='Linimasa status pesanan' className='flex flex-col'>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const isCompleted = step.state === 'completed'
        const isCurrent = step.state === 'current'
        const isCancelled = step.state === 'cancelled'

        return (
          <li key={step.id} className='relative flex items-start gap-3 pb-5 last:pb-0'>
            {!isLast && (
              <span
                aria-hidden='true'
                className={cn(
                  'absolute top-6 left-2.5 h-[calc(100%-1.5rem)] w-px',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
              />
            )}

            <span
              className={cn(
                'relative z-10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                isCompleted
                  ? 'border-primary bg-primary text-primary-foreground'
                  : isCancelled
                    ? 'border-destructive bg-destructive text-primary-foreground'
                    : isCurrent
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <Check className='size-3' aria-hidden='true' />
              ) : isCancelled ? (
                <X className='size-3' aria-hidden='true' />
              ) : (
                <Circle className='size-2 fill-current' aria-hidden='true' />
              )}
            </span>

            <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <span
                className={cn(
                  'text-sm leading-snug font-medium',
                  isCancelled
                    ? 'text-destructive'
                    : isCompleted || isCurrent
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
              {step.timestamp && (
                <span className='text-xs text-muted-foreground tabular-nums'>
                  {formatDateTimeId(step.timestamp)}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
