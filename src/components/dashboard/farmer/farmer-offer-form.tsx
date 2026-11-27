'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/api/use-auth'
import { useFarmerFarms, useFarmerOffer } from '@/hooks/api/use-farmer-management'
import { DashboardPageHeader } from '../dashboard-page-header'
import { OfferFormBody } from './farmer-offer-form-body'
import { FarmerVerificationBanner } from './farmer-verification-banner'

export function FarmerOfferFormView({
  offerId,
  copyFromOfferId,
}: {
  offerId?: string
  copyFromOfferId?: string
}) {
  const isEdit = Boolean(offerId)
  const { data: user } = useCurrentUser()
  const { data: farms = [], isLoading: farmsLoading } = useFarmerFarms()
  const {
    data: existingOffer,
    isLoading: offerLoading,
    isError: offerError,
  } = useFarmerOffer(offerId ?? '')
  const { data: copySource, isLoading: copyLoading } = useFarmerOffer(copyFromOfferId ?? '')

  const activeFarms = useMemo(() => farms.filter((farm) => farm.status === 'active'), [farms])
  const isLoading =
    farmsLoading || (isEdit && offerLoading) || (Boolean(copyFromOfferId) && copyLoading)

  return (
    <div className='flex flex-col gap-6'>
      <DashboardPageHeader
        title={isEdit ? 'Sunting Penawaran Panen' : 'Buat Penawaran Panen'}
        actions={
          <Button
            variant='outline'
            nativeButton={false}
            render={<Link href='/dashboard/penawaran' />}
          >
            <ArrowLeft data-icon='inline-start' aria-hidden='true' />
            <span>Kembali ke Penawaran</span>
          </Button>
        }
      />

      <FarmerVerificationBanner isVerified={user?.isVerifiedFarmer} context='offers' />

      {isLoading ? (
        <Skeleton className='h-96 max-w-4xl' />
      ) : isEdit && (offerError || !existingOffer) ? (
        <Alert variant='destructive' className='max-w-4xl'>
          <AlertCircle />
          <AlertDescription>Penawaran tidak ditemukan atau gagal dimuat.</AlertDescription>
        </Alert>
      ) : activeFarms.length === 0 ? (
        <Alert className='max-w-4xl'>
          <AlertCircle />
          <AlertDescription className='flex flex-wrap items-center justify-between gap-3'>
            <span>Tambahkan minimal satu kebun aktif sebelum membuat penawaran panen.</span>
            <Button size='sm' nativeButton={false} render={<Link href='/dashboard/kebun/baru' />}>
              Tambah kebun
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <OfferFormBody
          key={`${existingOffer?.id ?? 'new'}-${copySource?.id ?? ''}`}
          activeFarms={activeFarms}
          existingOffer={existingOffer}
          copySource={copySource}
          isVerified={Boolean(user?.isVerifiedFarmer)}
        />
      )}
    </div>
  )
}
