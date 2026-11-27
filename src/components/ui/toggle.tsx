'use client'

import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-2 rounded-lg text-sm leading-snug font-medium transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-']):not([class*='icon-'])]:size-(--icon-md)",
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-input bg-transparent hover:bg-muted',
      },
      size: {
        default:
          'min-h-11 min-w-11 px-4 py-2 text-sm sm:text-base pointer-coarse:min-h-12 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5',
        sm: "min-h-10 min-w-10 rounded-[min(var(--radius-md),12px)] px-3 py-1.5 text-sm pointer-coarse:min-h-11 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-4",
        lg: 'min-h-12 min-w-12 px-5 py-2.5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Toggle({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot='toggle'
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
