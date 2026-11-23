'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Bell,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Calendar,
  Sprout,
  AlertTriangle,
  Check,
  CheckCheck,
  BellOff,
  ArrowRight,
} from 'lucide-react'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/api/use-notifications'
import type { Notification, NotificationType } from '@/types/api/notifications'
import type { DashboardActor } from './dashboard-navigation-data'
import { cn } from '@/lib/utils'

interface DashboardSidebarNotificationsProps {
  userId?: string
  actor?: DashboardActor
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'order_update':
      return <ShoppingBag className='size-4 text-emerald-600 dark:text-emerald-400' />
    case 'payment_reminder':
      return <CreditCard className='size-4 text-amber-600 dark:text-amber-400' />
    case 'payment_verified':
      return <CheckCircle2 className='size-4 text-sky-600 dark:text-sky-400' />
    case 'schedule_proposal':
      return <Calendar className='size-4 text-indigo-600 dark:text-indigo-400' />
    case 'matched_offer':
      return <Sprout className='size-4 text-emerald-600 dark:text-emerald-400' />
    case 'system_alert':
    default:
      return <AlertTriangle className='size-4 text-rose-600 dark:text-rose-400' />
  }
}

function formatNotificationTime(isoString: string) {
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

export function DashboardSidebarNotifications({
  userId,
  actor,
}: DashboardSidebarNotificationsProps) {
  const { isMobile } = useSidebar()
  const [isOpen, setIsOpen] = React.useState(false)
  const [tab, setTab] = React.useState<'all' | 'unread'>('all')

  const { data: notifications = [] } = useNotifications(userId)
  const unreadCount = useUnreadNotificationsCount(userId)
  const { mutate: markAsRead } = useMarkNotificationRead()
  const { mutate: markAllAsRead, isPending: isMarkingAllPending } =
    useMarkAllNotificationsRead(userId)

  const displayedNotifications = React.useMemo(() => {
    if (tab === 'unread') {
      return notifications.filter((item) => !item.isRead)
    }
    return notifications
  }, [notifications, tab])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            render={
              <SidebarMenuButton
                tooltip={`Pemberitahuan${unreadCount > 0 ? ` (${unreadCount} belum dibaca)` : ''}`}
                className='relative hover:bg-sidebar-accent focus-visible:ring-1 focus-visible:ring-sidebar-ring'
              />
            }
          >
            <div className='relative shrink-0'>
              <Bell className='size-4' />
              {unreadCount > 0 && (
                <span className='absolute -top-1 -right-1 size-2 rounded-full bg-primary ring-2 ring-sidebar group-data-[collapsible=icon]:block hidden' />
              )}
            </div>
            <span className='truncate font-medium text-sidebar-foreground group-data-[collapsible=icon]:hidden'>
              Pemberitahuan
            </span>
            {unreadCount > 0 && (
              <SidebarMenuBadge className='bg-primary/15 text-primary text-[10px] font-semibold h-4 min-w-4 px-1 rounded-full'>
                {unreadCount}
              </SidebarMenuBadge>
            )}
          </SheetTrigger>

          <SheetContent
            side={isMobile ? 'bottom' : 'right'}
            className='w-full sm:max-w-md p-0 flex flex-col gap-0 border-l border-border bg-background'
          >
            <SheetHeader className='p-4 border-b border-border bg-sidebar/50'>
              <div className='flex items-center justify-between gap-2 pr-6'>
                <div className='space-y-0.5 text-left'>
                  <div className='flex items-center gap-2'>
                    <SheetTitle>Pusat Pemberitahuan</SheetTitle>
                    {unreadCount > 0 && (
                      <Badge variant='default' size='sm' className='h-4 px-1.5 text-[10px]'>
                        {unreadCount} baru
                      </Badge>
                    )}
                  </div>
                  <SheetDescription>
                    {actor === 'farmer'
                      ? 'Aktivitas pesanan, komoditas, dan status verifikasi kebun Anda.'
                      : 'Notifikasi operasional transaksi, verifikasi, dan aduan sistem.'}
                  </SheetDescription>
                </div>
              </div>

              {unreadCount > 0 && (
                <div className='mt-2 pt-2 border-t border-border/60 flex items-center justify-between'>
                  <span className='text-[11px] text-muted-foreground'>
                    {unreadCount} pemberitahuan belum dibaca
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    disabled={isMarkingAllPending}
                    onClick={() => markAllAsRead()}
                    className='h-7 text-xs gap-1 px-2 text-primary hover:text-primary hover:bg-primary/10'
                  >
                    <CheckCheck className='size-3.5' />
                    <span>Tandai Semua Dibaca</span>
                  </Button>
                </div>
              )}
            </SheetHeader>

            <Tabs
              value={tab}
              onValueChange={(val) => setTab(val as 'all' | 'unread')}
              className='flex-1 flex flex-col min-h-0 gap-0'
            >
              <div className='p-2 border-b border-border bg-muted/30'>
                <TabsList className='w-full grid grid-cols-2 h-7'>
                  <TabsTrigger value='all' className='text-xs'>
                    Semua ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value='unread' className='text-xs'>
                    Belum Dibaca ({unreadCount})
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className='flex-1 overflow-y-auto p-3 space-y-2.5'>
                {displayedNotifications.length === 0 ? (
                  <div className='py-12'>
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant='icon'>
                          <BellOff className='size-4' />
                        </EmptyMedia>
                        <EmptyTitle>
                          {tab === 'unread'
                            ? 'Tidak Ada Pesan Belum Dibaca'
                            : 'Belum Ada Pemberitahuan'}
                        </EmptyTitle>
                        <EmptyDescription>
                          {tab === 'unread'
                            ? 'Seluruh pemberitahuan telah Anda baca.'
                            : 'Pemberitahuan terkini seputar pesanan dan sistem akan muncul di sini.'}
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </div>
                ) : (
                  displayedNotifications.map((notif: Notification) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'p-3 border text-left transition-colors relative flex flex-col gap-1.5',
                        notif.isRead
                          ? 'bg-card/40 border-border/60 opacity-80'
                          : 'bg-card border-border shadow-xs'
                      )}
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex items-center gap-2 min-w-0'>
                          <div className='flex size-6 shrink-0 items-center justify-center bg-muted'>
                            {getNotificationIcon(notif.type)}
                          </div>
                          <span className='truncate font-semibold text-xs text-foreground'>
                            {notif.title}
                          </span>
                        </div>
                        <div className='flex items-center gap-1.5 shrink-0'>
                          {!notif.isRead && (
                            <span className='size-2 rounded-full bg-primary shrink-0' />
                          )}
                          {!notif.isRead && (
                            <Button
                              variant='ghost'
                              size='icon'
                              className='size-6 text-muted-foreground hover:text-foreground'
                              title='Tandai sudah dibaca'
                              onClick={() => markAsRead(notif.id)}
                            >
                              <Check className='size-3.5' />
                              <span className='sr-only'>Tandai dibaca</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className='text-xs text-muted-foreground leading-relaxed pl-8'>
                        {notif.message}
                      </p>

                      <div className='flex items-center justify-between gap-2 pt-1 pl-8 text-[10px] text-muted-foreground'>
                        <span>{formatNotificationTime(notif.createdAt)}</span>
                        {notif.link && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 px-1.5 text-[11px] text-primary hover:text-primary hover:bg-primary/10 gap-1'
                            render={<Link href={notif.link} onClick={() => setIsOpen(false)} />}
                            nativeButton={false}
                          >
                            <span>Buka Menu</span>
                            <ArrowRight className='size-3' />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Tabs>
          </SheetContent>
        </Sheet>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
