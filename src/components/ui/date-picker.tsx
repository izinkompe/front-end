'use client'

import { useState, type ReactNode } from 'react'
import { format, type Locale } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import type { DayPickerProps } from 'react-day-picker'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface DatePickerProps {
  id?: string
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  displayValue?: string
  ariaLabel?: string
  disabled?: DayPickerProps['disabled']
  defaultMonth?: Date
  locale?: Locale
  align?: 'start' | 'center' | 'end'
  leadingIcon?: ReactNode
  showChevron?: boolean
  showTodayAction?: boolean
  todayLabel?: string
  onToday?: () => void
  showClearAction?: boolean
  clearLabel?: string
  onClear?: () => void
  triggerClassName?: string
  contentClassName?: string
}

export function DatePicker({
  id,
  value,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  placeholder = 'Pilih tanggal',
  displayValue,
  ariaLabel,
  disabled,
  defaultMonth,
  locale = idLocale,
  align = 'start',
  leadingIcon,
  showChevron = true,
  showTodayAction = false,
  todayLabel = 'Hari ini',
  onToday,
  showClearAction = false,
  clearLabel = 'Hapus',
  onClear,
  triggerClassName,
  contentClassName,
}: DatePickerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  function handleOpenChange(nextOpen: boolean) {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  const labelText = displayValue ?? (value ? format(value, 'd MMM yyyy', { locale }) : placeholder)
  const hasFooter = showTodayAction || showClearAction

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type='button'
            variant='outline'
            aria-label={ariaLabel}
            className={cn(
              'w-full min-w-0 justify-between gap-2 font-normal',
              !value && !displayValue && 'text-muted-foreground',
              triggerClassName
            )}
          />
        }
      >
        <span className='flex min-w-0 items-center gap-2'>
          {leadingIcon ?? <CalendarIcon data-icon='inline-start' aria-hidden='true' />}
          <span className='truncate tabular-nums'>{labelText}</span>
        </span>
        {showChevron && <ChevronDown data-icon='inline-end' aria-hidden='true' />}
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn(
          'w-auto max-w-[calc(100vw-2rem)] min-w-72 gap-0 p-0 sm:min-w-80',
          contentClassName
        )}
      >
        <Calendar
          mode='single'
          selected={value}
          onSelect={(date) => {
            onValueChange?.(date)
            handleOpenChange(false)
          }}
          defaultMonth={defaultMonth ?? value}
          disabled={disabled}
          locale={locale}
          className='w-full'
          classNames={{ root: 'w-full' }}
        />
        {hasFooter && (
          <div className='flex items-center justify-between gap-2 px-2.5 pt-1 pb-2.5'>
            {showTodayAction ? (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => {
                  if (onToday) {
                    onToday()
                  } else {
                    onValueChange?.(new Date())
                  }
                  handleOpenChange(false)
                }}
              >
                {todayLabel}
              </Button>
            ) : (
              <span />
            )}
            {showClearAction && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                disabled={!value}
                onClick={() => {
                  if (onClear) {
                    onClear()
                  } else {
                    onValueChange?.(undefined)
                  }
                  handleOpenChange(false)
                }}
              >
                {clearLabel}
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
