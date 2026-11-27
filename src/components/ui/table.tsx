import * as React from 'react'
import { cn } from 'cn'

type TableProps = React.ComponentProps<'table'> & {
  responsiveLayout?: 'scroll' | 'stack'
  stickyHeader?: boolean
  stickyRowHeader?: boolean
  density?: 'compact' | 'default' | 'comfortable'
  containerClassName?: string
  containerProps?: Omit<React.ComponentProps<'div'>, 'className' | 'children'>
}

function Table({
  className,
  responsiveLayout = 'scroll',
  stickyHeader = false,
  stickyRowHeader = false,
  density = 'default',
  containerClassName,
  containerProps,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: TableProps) {
  const regionLabel = ariaLabel ?? (!ariaLabelledBy ? 'Tabel data' : undefined)

  return (
    <div
      data-slot='table-container'
      data-responsive={responsiveLayout}
      data-sticky-header={stickyHeader ? 'true' : undefined}
      data-sticky-row-header={stickyRowHeader ? 'true' : undefined}
      data-density={density}
      role='region'
      tabIndex={0}
      aria-label={regionLabel}
      aria-labelledby={ariaLabelledBy}
      {...containerProps}
      className={cn(
        'group/table @container/table relative w-full max-w-full min-w-0 overflow-x-auto rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        stickyHeader && 'max-h-[min(32rem,75dvh)] overflow-y-auto',
        containerClassName
      )}
    >
      <table
        data-slot='table'
        className={cn(
          'w-full border-separate border-spacing-0 caption-bottom text-sm text-foreground',
          className
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot='table-header'
      className={cn('[&_tr]:border-b [&_th]:border-b [&_th]:border-border', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot='table-body'
      className={cn('[&_tr:last-child_td]:border-b-0 [&_tr:last-child_th]:border-b-0', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot='table-footer'
      className={cn(
        'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0 [&>tr>td]:border-t [&>tr>td]:border-border',
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot='table-row'
      className={cn(
        'transition-colors focus-within:bg-muted/40 hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, scope = 'col', ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot='table-head'
      scope={scope}
      className={cn(
        'min-h-11 border-b border-border px-3 py-2.5 text-start align-middle font-medium whitespace-nowrap text-foreground pointer-coarse:py-3 group-data-[density=compact]/table:min-h-9 group-data-[density=compact]/table:px-2 group-data-[density=compact]/table:py-1.5 group-data-[density=comfortable]/table:px-4 group-data-[density=comfortable]/table:py-3.5 [&:has([role=checkbox])]:pe-0',
        className
      )}
      {...props}
    />
  )
}

type TableCellProps = React.ComponentProps<'td'> & {
  label?: string
  nowrap?: boolean
}

function TableCell({ className, label, nowrap = false, ...props }: TableCellProps) {
  return (
    <td
      data-slot='table-cell'
      data-label={label}
      className={cn(
        'border-b border-border px-3 py-2.5 text-start align-middle wrap-break-word pointer-coarse:py-3 group-data-[density=compact]/table:px-2 group-data-[density=compact]/table:py-1.5 group-data-[density=comfortable]/table:px-4 group-data-[density=comfortable]/table:py-3.5 [&:has([role=checkbox])]:pe-0',
        nowrap && 'whitespace-nowrap',
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot='table-caption'
      className={cn('mt-3 text-start text-meta text-muted-foreground', className)}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
export type { TableProps, TableCellProps }
