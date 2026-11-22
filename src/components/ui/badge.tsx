import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-none border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&>svg]:size-3 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border bg-background text-foreground',
        destructive: 'border-destructive/20 bg-destructive/10 text-destructive',
        success: 'border-emerald-500/20 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
        warning: 'border-amber-500/20 bg-amber-500/15 text-amber-700 dark:text-amber-400',
        info: 'border-sky-500/20 bg-sky-500/15 text-sky-700 dark:text-sky-400',
      },
      size: {
        default: 'h-5 gap-1 px-2',
        sm: 'h-4 gap-0.5 px-1.5 text-[10px]',
        lg: 'h-6 gap-1.5 px-2.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot='badge'
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
