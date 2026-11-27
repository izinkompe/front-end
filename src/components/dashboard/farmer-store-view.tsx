'use client'

import Link from 'next/link'
import { AlertCircle, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useFarmerStoreSettings } from '@/hooks/api/use-farmer-management'
import { DashboardPageHeader } from './dashboard-page-header'
import { StoreProfileTab } from './farmer/store-profile-tab'
import { StoreReviewsTable } from './farmer/store-reviews-table'
import { StoreShowcaseTable } from './farmer/store-showcase-table'

export function FarmerStoreView() {
  const { data: user } = useCurrentUser()
  const { data: settings, isLoading, isError } = useFarmerStoreSettings()

  if (isLoading) {
    return (
      <div className='flex flex-col gap-4'>
        <Skeleton className='h-10 w-64' />
        <Skeleton className='h-80 w-full' />
      </div>
    )
  }

  if (isError || !settings) {
    return (
      <Alert variant='destructive'>
        <AlertCircle />
        <AlertDescription>Gagal memuat pengaturan toko petani.</AlertDescription>
      </Alert>
    )
  }

  const publicHref = `/petani/${encodeURIComponent(user?.id ?? settings.farmerId)}`

  return (
    <div className='flex flex-col gap-6'>
      <DashboardPageHeader
        title='Toko Saya'
        actions={
          <Button
            variant='outline'
            className='w-full sm:w-auto'
            nativeButton={false}
            render={<Link href={publicHref} />}
          >
            <ExternalLink data-icon='inline-start' aria-hidden='true' />
            <span>Lihat toko publik</span>
          </Button>
        }
      />

      <Tabs defaultValue='profile' className='flex flex-col gap-4'>
        <TabsList className='scroll-strip max-w-full justify-start'>
          <TabsTrigger value='profile'>Profil & Rekening</TabsTrigger>
          <TabsTrigger value='showcase'>Etalase Toko</TabsTrigger>
          <TabsTrigger value='reviews'>Ulasan Pembeli</TabsTrigger>
        </TabsList>

        <TabsContent value='profile'>
          <StoreProfileTab key={settings.updatedAt} settings={settings} />
        </TabsContent>

        <TabsContent value='showcase'>
          <StoreShowcaseTable settings={settings} />
        </TabsContent>

        <TabsContent value='reviews'>
          <StoreReviewsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
