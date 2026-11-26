'use client'

import { useEffect, useState } from 'react'
import { ChevronUp, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CatalogScrollTopButtonProps {
  splitActive: boolean
  activeFilterCount: number
  onOpenFilterSheet: () => void
}

export function CatalogScrollTopButton({
  splitActive,
  activeFilterCount,
  onOpenFilterSheet,
}: CatalogScrollTopButtonProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 360)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  function handleScrollToTop() {
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <div
      className={cn(
        'fixed bottom-5 z-30 flex items-center gap-2',
        splitActive ? 'right-5 lg:right-[calc(38%+1.5rem)] xl:right-[calc(36%+1.5rem)]' : 'right-5'
      )}
    >
      <Button
        type='button'
        variant='default'
        onClick={onOpenFilterSheet}
        aria-label='Buka semua filter'
        className='min-h-11 rounded-full px-4 text-sm font-semibold shadow-lg pointer-coarse:min-h-12'
      >
        <SlidersHorizontal className='icon-sm' aria-hidden='true' />
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <Badge variant='secondary' className='ml-0.5 min-h-5 px-2 py-0 text-xs tabular-nums'>
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      <Button
        type='button'
        variant='outline'
        onClick={handleScrollToTop}
        aria-label='Kembali ke atas halaman'
        className='min-h-11 rounded-full border-muted-foreground/45 bg-card/95 px-3.5 text-sm font-medium text-foreground shadow-md backdrop-blur-xs transition-colors pointer-coarse:min-h-12 hover:border-foreground/65 hover:bg-muted'
      >
        <ChevronUp className='icon-sm' aria-hidden='true' />
        <span>Ke atas</span>
      </Button>
    </div>
  )
}
