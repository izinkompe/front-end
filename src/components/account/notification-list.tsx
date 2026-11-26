'use client'

import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/api/use-notifications'
import { formatDateTimeId } from '@/lib/data/offer-detail-helpers'
import {
  getNotificationHref,
  notificationCategoryByType,
  type NotificationCategory,
} from '@/lib/data/notification-helpers'
import { cn } from '@/lib/utils'

export function NotificationList({
  unreadOnly = false,
  category,
  limit,
  onNavigate,
}: {
  unreadOnly?: boolean
  category?: NotificationCategory
  limit?: number
  onNavigate?: () => void
}) {
  const { data, isLoading, isError, refetch } = useNotifications()
  const read = useMarkNotificationRead()
  const readAll = useMarkAllNotificationsRead()

  if (isLoading) return <Skeleton className='h-24 w-full' />
  if (isError) {
    return (
      <Alert variant='destructive'>
        <AlertDescription className='flex flex-wrap items-center justify-between gap-3'>
          <span>Notifikasi gagal dimuat.</span>
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            Muat ulang
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const notifications = (data ?? [])
    .filter(
      (item) =>
        (!unreadOnly || !item.isRead) &&
        (!category || notificationCategoryByType[item.type] === category)
    )
    .slice(0, limit)

  const hasUnread = Boolean(data?.some((item) => !item.isRead))

  return (
    <div className='flex flex-col gap-3'>
      {hasUnread && (
        <div className='flex justify-end'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={readAll.isPending}
            onClick={() => readAll.mutate()}
          >
            {readAll.isPending && <Spinner data-icon='inline-start' />}
            <span>Tandai semua dibaca</span>
          </Button>
        </div>
      )}

      {(read.isError || readAll.isError) && (
        <Alert variant='destructive'>
          <AlertDescription>Notifikasi gagal ditandai. Coba lagi.</AlertDescription>
        </Alert>
      )}

      {notifications.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {category
                ? 'Tidak ada notifikasi dalam kategori ini'
                : unreadOnly
                  ? 'Semua notifikasi sudah dibaca'
                  : 'Belum ada notifikasi'}
            </EmptyTitle>
            <EmptyDescription>
              Pembaruan pesanan, pembayaran, dan penawaran terdekat akan muncul di sini.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className='flex flex-col divide-y divide-border'>
          {notifications.map((item) => {
            const href = getNotificationHref(item.link)
            return (
              <li
                key={item.id}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-md px-2 py-3 text-sm transition-colors',
                  !item.isRead && 'bg-primary/5'
                )}
              >
                <div className='flex w-full flex-wrap items-center justify-between gap-2'>
                  <div className='flex flex-wrap items-center gap-2'>
                    {!item.isRead && (
                      <span
                        className='size-2 shrink-0 rounded-full bg-primary'
                        aria-hidden='true'
                      />
                    )}
                    {href ? (
                      <Link
                        href={href}
                        className='font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:underline'
                        onNavigate={() => {
                          if (!item.isRead) read.mutate(item.id)
                          onNavigate?.()
                        }}
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <p className='font-semibold text-foreground'>{item.title}</p>
                    )}
                  </div>
                  <Badge variant='outline'>{notificationCategoryByType[item.type]}</Badge>
                </div>

                <p className='text-muted-foreground'>{item.message}</p>

                <div className='flex w-full flex-wrap items-center justify-between gap-2'>
                  <time
                    className='text-xs text-muted-foreground tabular-nums'
                    dateTime={item.createdAt}
                  >
                    {formatDateTimeId(item.createdAt)}
                  </time>
                  {!href && !item.isRead && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-7 px-2 text-xs'
                      onClick={() => read.mutate(item.id)}
                      disabled={read.isPending}
                    >
                      Tandai dibaca
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
