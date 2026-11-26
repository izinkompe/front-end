'use client'

import { id } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronDown, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { formatPickupDateLabel } from './hero-search-params'

const controlTriggerClassName =
  'min-h-12 w-full border-input bg-background text-foreground hover:bg-muted/50 dark:bg-input/30 dark:hover:bg-input/50'

const controlIconClassName = 'size-4 shrink-0 text-muted-foreground'

interface HeroFilterSelectProps<T extends string> {
  id?: string
  value: T
  onValueChange: (value: string | null) => void
  options: ReadonlyArray<{ value: T; label: string }>
  icons: Record<T, LucideIcon>
  ariaLabel: string
  fallbackLabel: string
}

export function HeroFilterSelect<T extends string>({
  id,
  value,
  onValueChange,
  options,
  icons,
  ariaLabel,
  fallbackLabel,
}: HeroFilterSelectProps<T>) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? fallbackLabel
  const SelectedIcon: LucideIcon = icons[value]

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={controlTriggerClassName} aria-label={ariaLabel}>
        <SelectValue>
          <SelectedIcon className={controlIconClassName} aria-hidden='true' />
          <span className='truncate text-foreground'>{selectedLabel}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => {
            const OptionIcon: LucideIcon = icons[option.value]
            return (
              <SelectItem key={option.value} value={option.value}>
                <span className='flex items-center gap-2'>
                  <OptionIcon className={controlIconClassName} aria-hidden='true' />
                  <span>{option.label}</span>
                </span>
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

interface PickupCalendarPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | undefined
  today: Date | undefined
  onSelectDate: (date: Date | undefined) => void
  onSelectToday: () => void
  onClearDate: () => void
}

export function PickupCalendarPopover({
  open,
  onOpenChange,
  selectedDate,
  today,
  onSelectDate,
  onSelectToday,
  onClearDate,
}: PickupCalendarPopoverProps) {
  const pickupDateLabel = selectedDate ? formatPickupDateLabel(selectedDate) : 'Semua jadwal'

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type='button'
            variant='outline'
            className={`${controlTriggerClassName} justify-between py-2 pr-3 pl-3.5 font-normal hover:text-foreground aria-expanded:bg-muted/50 aria-expanded:text-foreground`}
            aria-label='Pilih tanggal jadwal pengambilan mandiri'
          />
        }
      >
        <span className='flex min-w-0 items-center gap-2'>
          <CalendarIcon className={controlIconClassName} aria-hidden='true' />
          <span className='truncate text-foreground'>{pickupDateLabel}</span>
        </span>
        <ChevronDown className={controlIconClassName} aria-hidden='true' />
      </PopoverTrigger>

      <PopoverContent align='start' className='w-auto min-w-80 gap-0 p-0'>
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={onSelectDate}
          defaultMonth={selectedDate ?? today}
          disabled={today ? { before: today } : undefined}
          locale={id}
          className='w-full'
          classNames={{ root: 'w-full' }}
        />
        <Separator />
        <div className='flex items-center justify-between gap-2 p-2.5'>
          <Button type='button' variant='ghost' size='sm' onClick={onSelectToday}>
            Hari ini
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onClearDate}
            disabled={!selectedDate}
          >
            Semua jadwal
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
