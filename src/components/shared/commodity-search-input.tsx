'use client'

import { Search, X } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

interface CommoditySearchInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  ariaLabel?: string
  maxLength?: number
  className?: string
}

export function CommoditySearchInput({
  id,
  value,
  onChange,
  onClear,
  placeholder = 'Cari tomat, buncis, mangga...',
  ariaLabel = 'Cari nama komoditas',
  maxLength = 100,
  className,
}: CommoditySearchInputProps) {
  function handleClear() {
    if (onClear) {
      onClear()
      return
    }
    onChange('')
  }

  return (
    <InputGroup className={cn('min-h-12 border-input bg-background dark:bg-input/30', className)}>
      <InputGroupAddon align='inline-start'>
        <Search className='size-4 shrink-0 text-muted-foreground' aria-hidden='true' />
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        type='search'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        maxLength={maxLength}
        className='[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden'
      />
      {value.length > 0 && (
        <InputGroupAddon align='inline-end' className='pr-3'>
          <button
            type='button'
            onClick={handleClear}
            aria-label='Hapus kata kunci pencarian'
            className='inline-flex items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
          >
            <X className='size-4 shrink-0' aria-hidden='true' />
          </button>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
