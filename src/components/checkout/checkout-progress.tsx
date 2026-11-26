import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckoutProgressProps {
  currentStep: 1 | 2
  completedAll?: boolean
}

const STEPS = [
  { number: 1 as const, label: 'Konfirmasi pesanan' },
  { number: 2 as const, label: 'Transfer dan bukti bayar' },
]

export function CheckoutProgress({ currentStep, completedAll = false }: CheckoutProgressProps) {
  return (
    <nav aria-label='Tahapan checkout' className='w-full'>
      <ol className='flex flex-wrap items-center gap-3 sm:gap-5'>
        {STEPS.map((step, index) => {
          const isCompleted = completedAll || step.number < currentStep
          const isCurrent = !completedAll && step.number === currentStep

          return (
            <li
              key={step.number}
              aria-current={isCurrent ? 'step' : undefined}
              className='flex items-center gap-2.5'
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tabular-nums',
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isCurrent
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className='size-4' aria-hidden='true' /> : step.number}
              </span>
              <span
                className={cn(
                  'text-sm font-medium sm:text-base',
                  isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <span
                  className='ml-1 hidden h-px w-8 bg-border sm:inline-block'
                  aria-hidden='true'
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
