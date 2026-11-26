'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CatalogScrollTopButtonProps {
  splitActive: boolean
}

export function CatalogScrollTopButton({ splitActive }: CatalogScrollTopButtonProps) {
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
    <Button
      type='button'
      variant='outline'
      size='sm'
      onClick={handleScrollToTop}
      aria-label='Kembali ke atas halaman'
      className={cn(
        'fixed bottom-5 z-30 min-h-10 rounded-full border-muted-foreground/45 bg-card/95 px-3.5 text-sm font-medium text-foreground shadow-md backdrop-blur-xs transition-colors pointer-coarse:min-h-11 hover:border-foreground/65 hover:bg-muted',
        splitActive ? 'right-5 lg:right-[calc(38%+1.5rem)] xl:right-[calc(36%+1.5rem)]' : 'right-5'
      )}
    >
      <ChevronUp data-icon='inline-start' aria-hidden='true' />
      <span>Ke atas</span>
    </Button>
  )
}
