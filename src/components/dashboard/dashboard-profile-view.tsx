'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { AccountProfileForm } from '@/components/account/account-profile-form'
import { AccountVerificationView } from '@/components/account/account-verification-view'
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrentUser } from '@/hooks/api/use-auth'
import {
  calculateProfileCompletion,
  formatUserRoleLabel,
  getUserInitials,
  isSafeAvatarUrl,
} from '@/lib/data/profile-helpers'

export function DashboardProfileView() {
  const { data: currentUser, isLoading } = useCurrentUser()
  const [activeTab, setActiveTab] = useState('profile')

  if (isLoading) {
    return (
      <div className='flex flex-col gap-6'>
        <DashboardPageHeader title='Data Profil' />
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]'>
          <Skeleton className='h-40 w-full rounded-xl' />
          <Skeleton className='h-96 w-full rounded-xl' />
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className='flex flex-col gap-6'>
        <DashboardPageHeader title='Data Profil' />
        <Alert>
          <AlertCircle aria-hidden='true' />
          <AlertDescription className='flex flex-wrap items-center justify-between gap-3'>
            <span>Masuk dengan akun mitra untuk mengubah data profil.</span>
            <Button
              size='sm'
              variant='outline'
              nativeButton={false}
              render={<Link href='/masuk-petani' />}
            >
              Masuk Mitra
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const completion = calculateProfileCompletion(currentUser)
  const avatarSrc = isSafeAvatarUrl(currentUser.avatarUrl)

  return (
    <div className='flex flex-col gap-6'>
      <DashboardPageHeader title='Data Profil' />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start'>
        <aside className='flex flex-col gap-4 lg:sticky lg:top-20'>
          <Card>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex items-center gap-3'>
                <Avatar className='size-14 shrink-0'>
                  {avatarSrc && <AvatarImage src={avatarSrc} alt={currentUser.name} />}
                  <AvatarFallback>{getUserInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                  <p className='truncate text-base font-semibold text-foreground'>
                    {currentUser.name}
                  </p>
                  <p className='truncate text-sm text-muted-foreground'>
                    {currentUser.organization?.trim() || formatUserRoleLabel(currentUser.role)}
                  </p>
                </div>
              </div>

              {completion.percentage < 100 && (
                <div className='flex flex-col gap-2 pt-2'>
                  <div className='flex items-center justify-between gap-2 text-sm tabular-nums'>
                    <span className='font-semibold text-primary'>{completion.percentage}%</span>
                    <span className='text-muted-foreground'>
                      {completion.completedCount} / {completion.totalCount} data terisi
                    </span>
                  </div>
                  <Progress value={completion.percentage} aria-label='Kelengkapan data profil' />
                  {completion.nextStepText && (
                    <p className='text-meta text-muted-foreground'>{completion.nextStepText}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='flex min-w-0 flex-col gap-4'
        >
          <TabsList className='scroll-strip max-w-full justify-start'>
            <TabsTrigger value='profile'>Data Profil</TabsTrigger>
            <TabsTrigger value='verification'>Kontak &amp; Verifikasi</TabsTrigger>
          </TabsList>

          <TabsContent value='profile'>
            <AccountProfileForm onVerificationClick={() => setActiveTab('verification')} />
          </TabsContent>

          <TabsContent value='verification'>
            <AccountVerificationView inDashboard onEditPhone={() => setActiveTab('profile')} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
