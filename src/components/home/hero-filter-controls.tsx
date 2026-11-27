'use client'

import { Calendar as CalendarIcon, type LucideIcon } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatPickupDateLabel } from './hero-search-params'

const controlTriggerClassName =
  'min-h-12 w-full min-w-0 max-w-full border-input bg-background text-foreground hover:bg-muted/50 dark:bg-input/30 dark:hover:bg-input/50'

const controlIconClassName = 'icon-sm text-muted-foreground'

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
    <DatePicker
      open={open}
      onOpenChange={onOpenChange}
      value={selectedDate}
      onValueChange={onSelectDate}
      defaultMonth={selectedDate ?? today}
      disabled={today ? { before: today } : undefined}
      displayValue={pickupDateLabel}
      ariaLabel='Pilih tanggal jadwal pengambilan mandiri'
      leadingIcon={<CalendarIcon className={controlIconClassName} aria-hidden='true' />}
      triggerClassName={`${controlTriggerClassName} py-2 pr-3 pl-3.5 hover:text-foreground aria-expanded:bg-muted/50 aria-expanded:text-foreground`}
      showTodayAction
      onToday={onSelectToday}
      showClearAction
      clearLabel='Semua jadwal'
      onClear={onClearDate}
    />
  )
}
