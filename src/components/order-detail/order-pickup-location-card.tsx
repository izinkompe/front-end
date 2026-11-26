'use client'

import { CalendarClock, ExternalLink, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatPickupSlotLabel } from '@/lib/data/offer-detail-helpers'
import { buildPickupMapsHref } from '@/lib/data/order-pickup-helpers'
import type { Order } from '@/types/api/orders'
import { OrderPickupPassDialog } from './order-pickup-pass-dialog'

export function OrderPickupLocationCard({
  order,
  showPickupActions,
  showOrganization,
  onPrintPickupPass,
}: {
  order: Order
  showPickupActions: boolean
  showOrganization: boolean
  onPrintPickupPass: () => void
}) {
  const mapsHref = buildPickupMapsHref(
    order.pickupLocation.latitude,
    order.pickupLocation.longitude
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lokasi pengambilan</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-3 text-sm'>
        <div className='flex items-start gap-2.5'>
          <Store className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
          <div className='flex flex-col gap-0.5'>
            <span className='font-semibold text-foreground'>
              {order.farmerName || 'Petani mitra PanganTani'}
            </span>
            <span className='text-foreground'>{order.pickupLocation.address}</span>
            {order.pickupLocation.notes && (
              <span className='text-muted-foreground'>{order.pickupLocation.notes}</span>
            )}
          </div>
        </div>

        <Separator />

        <div className='flex items-start gap-2.5'>
          <CalendarClock className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden='true' />
          <div className='flex flex-col gap-0.5'>
            <span className='text-xs text-muted-foreground'>Jadwal ambil</span>
            <span className='font-medium text-foreground tabular-nums'>
              {formatPickupSlotLabel(order.scheduleSlot)}
            </span>
          </div>
        </div>
      </CardContent>

      {showPickupActions && (order.status !== 'completed' || Boolean(mapsHref)) && (
        <CardFooter className='flex flex-wrap gap-2'>
          {order.status !== 'completed' && (
            <OrderPickupPassDialog
              order={order}
              showOrganization={showOrganization}
              onPrintPickupPass={onPrintPickupPass}
            />
          )}
          {mapsHref && (
            <Button
              variant='outline'
              size='sm'
              nativeButton={false}
              render={<a href={mapsHref} target='_blank' rel='noopener noreferrer' />}
            >
              <ExternalLink data-icon='inline-start' aria-hidden='true' />
              <span>Buka rute peta</span>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
