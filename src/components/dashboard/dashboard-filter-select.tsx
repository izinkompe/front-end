'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface DashboardFilterOption<T extends string = string> {
  value: T
  label: string
}

interface DashboardFilterSelectProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: readonly DashboardFilterOption<T>[]
  ariaLabel: string
  className?: string
}

export function DashboardFilterSelect<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  className = 'w-full sm:w-52',
}: DashboardFilterSelectProps<T>) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? value

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next as T)
      }}
    >
      <SelectTrigger aria-label={ariaLabel} size='sm' className={className}>
        <SelectValue>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
