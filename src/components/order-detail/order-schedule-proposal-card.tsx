'use client'

import { useState } from 'react'
import { AlertCircle, CalendarClock, Check, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useRespondScheduleProposal } from '@/hooks/api/use-orders'
import { formatPickupSlotLabel } from '@/lib/data/offer-detail-helpers'
import type { Order } from '@/types/api/orders'

interface OrderScheduleProposalCardProps {
  order: Order
}

export function OrderScheduleProposalCard({ order }: OrderScheduleProposalCardProps) {
  const respondMutation = useRespondScheduleProposal()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const proposedSlot = order.proposedScheduleSlot

  if (!proposedSlot && order.scheduleProposalStatus === 'accepted') {
    return (
      <Alert>
        <CalendarClock aria-hidden='true' />
        <AlertTitle>Jadwal pengambilan diperbarui</AlertTitle>
        <AlertDescription className='tabular-nums'>
          Jadwal baru disetujui: {formatPickupSlotLabel(order.scheduleSlot)}.
        </AlertDescription>
      </Alert>
    )
  }

  if (!proposedSlot && order.scheduleProposalStatus === 'rejected') {
    return (
      <Alert>
        <CalendarClock aria-hidden='true' />
        <AlertTitle>Usulan jadwal ditolak</AlertTitle>
        <AlertDescription>
          {order.scheduleProposalNote ||
            `Jadwal awal tetap berlaku: ${formatPickupSlotLabel(order.scheduleSlot)}.`}
        </AlertDescription>
      </Alert>
    )
  }

  if (!proposedSlot || !['processing', 'ready_for_pickup'].includes(order.status)) {
    return null
  }

  function handleAcceptProposal() {
    respondMutation.mutate({
      orderId: order.id,
      action: 'accept',
    })
  }

  function handleRejectProposal() {
    respondMutation.mutate(
      {
        orderId: order.id,
        action: 'reject',
        reason: rejectReason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setRejectOpen(false)
          setRejectReason('')
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usulan jadwal ambil baru</CardTitle>
        {order.scheduleProposalNote && (
          <CardDescription>{order.scheduleProposalNote}</CardDescription>
        )}
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        {respondMutation.isError && (
          <Alert variant='destructive'>
            <AlertCircle aria-hidden='true' />
            <AlertDescription>{respondMutation.error.message}</AlertDescription>
          </Alert>
        )}

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div className='flex flex-col gap-1 rounded-lg border border-border bg-muted/40 p-3.5'>
            <span className='text-xs font-medium text-muted-foreground'>Jadwal saat ini</span>
            <span className='text-sm font-medium text-foreground tabular-nums'>
              {formatPickupSlotLabel(order.scheduleSlot)}
            </span>
          </div>

          <div className='flex flex-col gap-1 rounded-lg border border-primary/50 bg-primary/8 p-3.5'>
            <span className='text-xs font-medium text-primary'>Usulan jadwal petani</span>
            <span className='text-sm font-semibold text-foreground tabular-nums'>
              {formatPickupSlotLabel(proposedSlot)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className='flex flex-wrap justify-end gap-2'>
        <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <AlertDialogTrigger
            render={
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={respondMutation.isPending}
              />
            }
          >
            <X data-icon='inline-start' aria-hidden='true' />
            <span>Tolak usulan</span>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tolak usulan jadwal baru?</AlertDialogTitle>
              <AlertDialogDescription>
                Jadwal pengambilan akan tetap memakai slot awal (
                {formatPickupSlotLabel(order.scheduleSlot)}).
              </AlertDialogDescription>
            </AlertDialogHeader>

            {respondMutation.isError && (
              <Alert variant='destructive'>
                <AlertDescription>{respondMutation.error.message}</AlertDescription>
              </Alert>
            )}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='reject-proposal-reason'>
                  Alasan penolakan (opsional)
                </FieldLabel>
                <FieldDescription id='reject-proposal-hint'>
                  Bantu petani mengetahui waktu yang Anda bisa.
                </FieldDescription>
                <Textarea
                  id='reject-proposal-reason'
                  rows={2}
                  maxLength={300}
                  aria-describedby='reject-proposal-hint'
                  placeholder='Misal: tim dapur hanya dapat menjemput di slot pagi'
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                />
              </Field>
            </FieldGroup>

            <AlertDialogFooter>
              <AlertDialogCancel autoFocus>Batal</AlertDialogCancel>
              <AlertDialogAction
                variant='destructive'
                disabled={respondMutation.isPending}
                onClick={handleRejectProposal}
              >
                {respondMutation.isPending && <Spinner data-icon='inline-start' />}
                <span>Ya, tolak usulan</span>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          type='button'
          size='sm'
          disabled={respondMutation.isPending}
          onClick={handleAcceptProposal}
        >
          {respondMutation.isPending ? (
            <Spinner data-icon='inline-start' />
          ) : (
            <Check data-icon='inline-start' aria-hidden='true' />
          )}
          <span>Terima jadwal baru</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
