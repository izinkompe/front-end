'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bell } from 'lucide-react'
import { NotificationList } from '@/components/account/notification-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUnreadNotificationsCount } from '@/hooks/api/use-notifications'
import { cn } from '@/lib/utils'

export function HeaderNotificationsPopover({
  signedIn,
  className,
  onSignIn,
}: {
  signedIn: boolean
  className?: string
  onSignIn: () => void
}) {
  const [open, setOpen] = useState(false)
  const count = useUnreadNotificationsCount()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className={cn('relative', className)}
            aria-label={count ? `Notifikasi, ${count} belum dibaca` : 'Notifikasi'}
          />
        }
      >
        <Bell aria-hidden='true' />
        {count > 0 && (
          <Badge
            aria-hidden='true'
            className='pointer-events-none absolute -top-1 -right-1 min-h-4 min-w-4 px-1 text-xs leading-none tabular-nums'
          >
            {count > 99 ? '99+' : count}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent align='end' sideOffset={8} className='w-(--available-width) max-w-sm p-0'>
        <div className='flex items-center justify-between gap-2 border-b border-border px-4 py-3'>
          <PopoverTitle className='text-base font-semibold'>Notifikasi</PopoverTitle>
          {signedIn && count > 0 && (
            <span className='text-sm text-muted-foreground tabular-nums'>{count} belum dibaca</span>
          )}
        </div>

        {signedIn ? (
          <>
            <ScrollArea className='overflow-hidden [&_[data-slot=scroll-area-viewport]]:max-h-[min(24rem,46dvh)]'>
              <div className='px-4 py-2'>
                <NotificationList limit={5} onNavigate={() => setOpen(false)} />
              </div>
            </ScrollArea>
            <div className='border-t border-border p-3'>
              <Button
                variant='outline'
                size='sm'
                className='w-full'
                nativeButton={false}
                render={<Link href='/akun/notifikasi' onNavigate={() => setOpen(false)} />}
              >
                Semua notifikasi
              </Button>
            </div>
          </>
        ) : (
          <div className='flex flex-col gap-3 p-4'>
            <p className='text-sm text-muted-foreground'>
              Masuk sebagai pembeli untuk melihat pembaruan pembayaran, jadwal, dan penawaran di
              sekitar Anda.
            </p>
            <Button
              size='sm'
              onClick={() => {
                setOpen(false)
                onSignIn()
              }}
            >
              Masuk untuk melihat notifikasi
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
