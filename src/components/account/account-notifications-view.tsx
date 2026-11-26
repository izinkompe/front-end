'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUnreadNotificationsCount } from '@/hooks/api/use-notifications'
import { notificationCategories, type NotificationCategory } from '@/lib/data/notification-helpers'
import { NotificationList } from './notification-list'

export function AccountNotificationsView() {
  const [category, setCategory] = useState<NotificationCategory | 'all'>('all')
  const unreadCount = useUnreadNotificationsCount()
  const filter = category === 'all' ? undefined : category

  return (
    <Card>
      <CardHeader className='gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <CardTitle className='text-2xl font-bold'>Notifikasi</CardTitle>
          <CardDescription>
            Pembaruan status pembayaran, usulan jadwal ambil, pengingat panen, dan info akun.
          </CardDescription>
        </div>

        <Field className='sm:w-52'>
          <FieldLabel htmlFor='notification-category'>Kategori</FieldLabel>
          <Select value={category} onValueChange={(value) => setCategory(value ?? 'all')}>
            <SelectTrigger id='notification-category' className='w-full'>
              <SelectValue>{filter ?? 'Semua kategori'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='all'>Semua kategori</SelectItem>
                {notificationCategories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue='all' className='gap-4'>
          <TabsList variant='line' className='w-full justify-start border-b border-border p-0'>
            <TabsTrigger value='all' className='flex-none px-1 pb-2.5 after:bottom-0'>
              Semua
            </TabsTrigger>
            <TabsTrigger value='unread' className='flex-none gap-2 px-1 pb-2.5 after:bottom-0'>
              <span>Belum dibaca</span>
              {unreadCount > 0 && (
                <Badge variant='secondary' className='h-5 px-1.5 text-xs tabular-nums'>
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='all'>
            <NotificationList category={filter} />
          </TabsContent>
          <TabsContent value='unread'>
            <NotificationList unreadOnly category={filter} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
