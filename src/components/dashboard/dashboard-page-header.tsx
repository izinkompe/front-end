'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { BreadcrumbTrail, type BreadcrumbTrailItem } from '@/components/ui/breadcrumb'
import { getDashboardBreadcrumbs } from '@/components/dashboard/dashboard-nav-config'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { cn } from '@/lib/utils'

interface DashboardPageSubtitleProps {
  children: ReactNode
  className?: string
}

export function DashboardPageSubtitle({ children, className }: DashboardPageSubtitleProps) {
  return <p className={cn('max-w-2xl text-base text-muted-foreground', className)}>{children}</p>
}

interface DashboardPageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
  actions?: ReactNode
  breadcrumbs?: BreadcrumbTrailItem[]
  className?: string
}

export function DashboardPageHeader({
  title,
  subtitle,
  badge,
  actions,
  breadcrumbs,
  className,
}: DashboardPageHeaderProps) {
  const pathname = usePathname()
  const { data: user } = useCurrentUser()
  const resolvedBreadcrumbs = breadcrumbs ?? getDashboardBreadcrumbs(pathname, user?.role)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <BreadcrumbTrail items={resolvedBreadcrumbs} className='min-w-0' />

      <div className='flex flex-col flex-wrap justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='flex min-w-0 flex-col gap-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h1 className='type-h1 font-semibold text-foreground'>{title}</h1>
            {badge}
          </div>
          {subtitle &&
            (typeof subtitle === 'string' ? (
              <DashboardPageSubtitle>{subtitle}</DashboardPageSubtitle>
            ) : (
              subtitle
            ))}
        </div>

        {actions && (
          <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto'>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
