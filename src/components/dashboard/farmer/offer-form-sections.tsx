'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { getDynamicPriceScheduleSteps } from '@/lib/data/offer-detail-helpers'
import { createUniqueId } from '@/lib/utils'
import type { CommodityCondition, ScheduleSlot } from '@/types/api/offers'

export const OFFER_CONDITION_OPTIONS: ReadonlyArray<{
  value: CommodityCondition
  label: string
}> = [
  { value: 'surplus', label: 'Surplus panen' },
  { value: 'grade_b', label: 'Grade B segar' },
  { value: 'imperfect_shape', label: 'Bentuk tidak seragam' },
  { value: 'ripe_urgent', label: 'Matang segera olah' },
]

export function toOfferDateInputValue(
  isoOrDate: string | undefined,
  fallbackOffsetDays = 0
): string {
  if (isoOrDate) {
    const parsed = new Date(isoOrDate)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10)
    }
  }
  return new Date(Date.now() + fallbackOffsetDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function toOfferDateTimeLocalValue(
  iso: string | undefined,
  fallbackOffsetHours = 24
): string {
  const date = iso ? new Date(iso) : new Date(Date.now() + fallbackOffsetHours * 60 * 60 * 1000)
  const resolved = Number.isNaN(date.getTime())
    ? new Date(Date.now() + fallbackOffsetHours * 60 * 60 * 1000)
    : date
  const offset = resolved.getTimezoneOffset() * 60 * 1000
  return new Date(resolved.getTime() - offset).toISOString().slice(0, 16)
}

export function DynamicPriceSection({
  enabled,
  startPrice,
  minPrice,
  dropIntervalHours,
  dropAmount,
  onToggle,
  onStartPriceChange,
  onMinPriceChange,
  onIntervalChange,
  onAmountChange,
}: {
  enabled: boolean
  startPrice: string
  minPrice: string
  dropIntervalHours: string
  dropAmount: string
  onToggle: (checked: boolean) => void
  onStartPriceChange: (value: string) => void
  onMinPriceChange: (value: string) => void
  onIntervalChange: (value: string) => void
  onAmountChange: (value: string) => void
}) {
  const start = Number(startPrice)
  const min = Number(minPrice)
  const interval = Number(dropIntervalHours)
  const amount = Number(dropAmount)
  const steps =
    enabled && start > 0 && min > 0 && interval > 0 && amount > 0
      ? getDynamicPriceScheduleSteps(start, {
          startPrice: start,
          minPrice: min,
          dropIntervalHours: interval,
          dropAmount: amount,
        })
      : []

  return (
    <Card size='sm' className='bg-muted/30'>
      <CardContent className='flex flex-col gap-4'>
        <Field orientation='horizontal'>
          <Switch
            id='offer-dynamic-switch'
            checked={enabled}
            onCheckedChange={(checked) => onToggle(Boolean(checked))}
          />
          <FieldLabel htmlFor='offer-dynamic-switch'>
            Aktifkan harga dinamis terjadwal berbasis waktu
          </FieldLabel>
        </Field>

        {enabled && (
          <div className='flex flex-col gap-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Field>
                <FieldLabel htmlFor='dyn-start-price'>Harga awal (IDR)</FieldLabel>
                <Input
                  id='dyn-start-price'
                  type='number'
                  min='100'
                  value={startPrice}
                  onChange={(e) => onStartPriceChange(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor='dyn-min-price'>Harga minimum (IDR)</FieldLabel>
                <Input
                  id='dyn-min-price'
                  type='number'
                  min='100'
                  value={minPrice}
                  onChange={(e) => onMinPriceChange(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor='dyn-interval'>Interval turun (jam)</FieldLabel>
                <Input
                  id='dyn-interval'
                  type='number'
                  min='1'
                  value={dropIntervalHours}
                  onChange={(e) => onIntervalChange(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor='dyn-amount'>Nominal turun (IDR)</FieldLabel>
                <Input
                  id='dyn-amount'
                  type='number'
                  min='100'
                  value={dropAmount}
                  onChange={(e) => onAmountChange(e.target.value)}
                />
              </Field>
            </div>

            {steps.length > 0 && (
              <div className='flex flex-col gap-2'>
                <span className='text-meta font-medium text-foreground'>
                  Pratinjau tahapan harga
                </span>
                <div className='flex flex-wrap gap-2'>
                  {steps.slice(0, 6).map((step) => (
                    <Badge key={step.stepNumber} variant='outline'>
                      Jam +{step.hoursFromStart}: {step.priceFormatted}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ScheduleSlotsEditor({
  slots,
  onChange,
  defaultDate,
}: {
  slots: ScheduleSlot[]
  onChange: (next: ScheduleSlot[]) => void
  defaultDate: string
}) {
  return (
    <Card size='sm'>
      <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-2'>
        <CardTitle className='text-base font-medium'>Slot jadwal pengambilan</CardTitle>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() =>
            onChange([
              ...slots,
              {
                id: createUniqueId('slot-').slice(0, 13),
                date: defaultDate,
                startTime: '13:00',
                endTime: '16:00',
                isAvailable: true,
              },
            ])
          }
        >
          <Plus data-icon='inline-start' aria-hidden='true' />
          <span>Tambah slot</span>
        </Button>
      </CardHeader>

      <CardContent className='flex flex-col gap-3'>
        {slots.map((slot, index) => (
          <Card key={slot.id} size='sm' className='bg-muted/20'>
            <CardContent className='grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]'>
              <Field>
                <FieldLabel htmlFor={`slot-date-${index}`}>Tanggal</FieldLabel>
                <Input
                  id={`slot-date-${index}`}
                  type='date'
                  value={slot.date}
                  onChange={(event) => {
                    const next = [...slots]
                    next[index] = { ...slot, date: event.target.value }
                    onChange(next)
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`slot-start-${index}`}>Jam mulai</FieldLabel>
                <Input
                  id={`slot-start-${index}`}
                  type='time'
                  value={slot.startTime}
                  onChange={(event) => {
                    const next = [...slots]
                    next[index] = { ...slot, startTime: event.target.value }
                    onChange(next)
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`slot-end-${index}`}>Jam selesai</FieldLabel>
                <Input
                  id={`slot-end-${index}`}
                  type='time'
                  value={slot.endTime}
                  onChange={(event) => {
                    const next = [...slots]
                    next[index] = { ...slot, endTime: event.target.value }
                    onChange(next)
                  }}
                />
              </Field>
              <div className='flex items-end'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  aria-label={`Hapus slot ${index + 1}`}
                  disabled={slots.length <= 1}
                  onClick={() => onChange(slots.filter((_, idx) => idx !== index))}
                >
                  <Trash2 aria-hidden='true' />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
