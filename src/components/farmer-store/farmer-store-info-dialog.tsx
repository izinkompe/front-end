'use client'

import { MapPin, Sprout } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  formatJoinedMonthYearId,
  getCommodityCategoryLabel,
  getFarmerTypeLabel,
} from '@/lib/data/farmer-store-helpers'
import type { FarmerStoreProfile } from '@/types/api/farmers'

interface FarmerStoreInfoDialogProps {
  farmer: FarmerStoreProfile
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FarmerStoreInfoDialog({ farmer, open, onOpenChange }: FarmerStoreInfoDialogProps) {
  const joinedLabel = formatJoinedMonthYearId(farmer.joinedAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{farmer.farmName}</DialogTitle>
          <DialogDescription>
            {getFarmerTypeLabel(farmer.farmerType)} di {farmer.areaName}
            {joinedLabel ? ` sejak ${joinedLabel}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-1 gap-5 py-2 sm:grid-cols-2'>
          <div className='flex flex-col gap-2'>
            <h2 className='text-sm font-semibold text-foreground'>Deskripsi Kebun</h2>
            <p className='text-sm leading-relaxed text-muted-foreground'>{farmer.description}</p>
          </div>

          <div className='flex flex-col gap-2'>
            <h2 className='text-sm font-semibold text-foreground'>Catatan Pengambilan</h2>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              {farmer.publicPickupNotes}
            </p>
          </div>
        </div>

        <Separator />

        <div className='flex flex-col gap-2.5'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <MapPin className='size-4 shrink-0 text-primary' aria-hidden='true' />
            <span>
              Wilayah kebun:{' '}
              <strong className='font-medium text-foreground'>{farmer.areaName}</strong>
            </span>
          </div>

          {farmer.primaryCommodities.length > 0 && (
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1.5 text-sm text-muted-foreground'>
                <Sprout className='size-4 shrink-0 text-primary' aria-hidden='true' />
                <span>Komoditas utama:</span>
              </span>
              {farmer.primaryCommodities.map((category) => (
                <Badge key={category} variant='secondary'>
                  {getCommodityCategoryLabel(category)}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
