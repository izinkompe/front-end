'use client'

import * as React from 'react'
import Link from 'next/link'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cn } from 'cn'
import { ChevronDownIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface BreadcrumbTrailItem {
  label: string
  href?: string
}

function Breadcrumb({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label='Breadcrumb' data-slot='breadcrumb' className={cn(className)} {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot='breadcrumb-list'
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot='breadcrumb-item'
      className={cn('inline-flex min-w-0 items-center gap-1', className)}
      {...props}
    />
  )
}

function BreadcrumbLink({ className, render, ...props }: useRender.ComponentProps<'a'>) {
  return useRender({
    defaultTagName: 'a',
    props: mergeProps<'a'>(
      {
        className: cn(
          'inline-flex min-h-9 items-center rounded-sm px-0.5 py-1 transition-colors pointer-coarse:min-h-11 hover:text-foreground hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: 'breadcrumb-link',
    },
  })
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='breadcrumb-page'
      role='link'
      aria-disabled='true'
      aria-current='page'
      className={cn('min-w-0 font-medium text-foreground', className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot='breadcrumb-separator'
      role='presentation'
      aria-hidden='true'
      className={cn('[&>svg]:size-(--icon-xs)', className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  )
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='breadcrumb-ellipsis'
      role='presentation'
      aria-hidden='true'
      className={cn('flex items-center justify-center [&>svg]:size-(--icon-sm)', className)}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className='sr-only'>Halaman lainnya</span>
    </span>
  )
}

function BreadcrumbTrail({
  items,
  maxVisibleItems = 2,
  ariaLabel = 'Breadcrumb',
  className,
}: {
  items: ReadonlyArray<BreadcrumbTrailItem>
  maxVisibleItems?: number
  ariaLabel?: string
  className?: string
}) {
  if (items.length === 0) return null

  const shouldCollapse = items.length > maxVisibleItems && items.length > 2
  const firstItem = items[0]
  const collapsedItems = shouldCollapse ? items.slice(1, -1) : []
  const lastItem = items[items.length - 1]

  return (
    <Breadcrumb aria-label={ariaLabel} className={cn('min-w-0', className)}>
      <BreadcrumbList>
        {shouldCollapse ? (
          <>
            <BreadcrumbItem>
              {firstItem.href ? (
                <BreadcrumbLink render={<Link href={firstItem.href} />}>
                  {firstItem.label}
                </BreadcrumbLink>
              ) : (
                <span>{firstItem.label}</span>
              )}
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type='button'
                      variant='ghost'
                      size='xs'
                      aria-label={`Pilih dari ${collapsedItems.length} halaman induk`}
                      className='min-h-9 gap-1 px-2 text-muted-foreground hover:text-foreground pointer-coarse:min-h-11'
                    />
                  }
                >
                  <BreadcrumbEllipsis />
                  <ChevronDownIcon className='icon-xs' aria-hidden='true' />
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start'>
                  {collapsedItems.map((item) =>
                    item.href ? (
                      <DropdownMenuItem
                        key={`${item.href}-${item.label}`}
                        render={<Link href={item.href} />}
                      >
                        {item.label}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem key={item.label} disabled>
                        {item.label}
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage className='truncate'>{lastItem.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <React.Fragment key={`${item.href ?? ''}-${item.label}`}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast || !item.href ? (
                    <BreadcrumbPage className='truncate'>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={item.href} />}>{item.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            )
          })
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbTrail,
  type BreadcrumbTrailItem,
}
