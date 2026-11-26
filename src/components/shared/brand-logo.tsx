import Link from 'next/link'
import { Sprout } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  href?: string
  ariaLabel?: string
  variant?: 'default' | 'transparent' | 'sidebar'
  size?: 'sm' | 'md'
  showWordmark?: boolean
  wordmarkClassName?: string
  className?: string
}

export function BrandLogo({
  href = '/',
  ariaLabel = 'PanganTani - Beranda',
  variant = 'default',
  size = 'md',
  showWordmark = true,
  wordmarkClassName,
  className,
}: BrandLogoProps) {
  const isTransparent = variant === 'transparent'
  const isSidebar = variant === 'sidebar'

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex shrink-0 items-center rounded-lg transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2',
        size === 'sm' ? 'min-h-9 gap-2 px-1 py-1' : 'min-h-11 gap-2.5',
        isTransparent
          ? 'focus-visible:ring-white/60'
          : isSidebar
            ? 'focus-visible:ring-sidebar-ring'
            : 'focus-visible:ring-ring',
        className
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
          size === 'sm' ? 'size-8' : 'size-10',
          isTransparent
            ? 'bg-white text-primary shadow-sm'
            : isSidebar
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'bg-primary text-primary-foreground'
        )}
      >
        <Sprout className={size === 'sm' ? 'size-4' : 'size-5'} aria-hidden='true' />
      </span>
      {showWordmark && (
        <span
          className={cn(
            size === 'sm' ? 'font-heading text-base font-semibold' : 'text-lg font-bold',
            isTransparent
              ? 'text-white'
              : isSidebar
                ? 'text-sidebar-foreground'
                : 'text-foreground',
            wordmarkClassName
          )}
        >
          PanganTani
        </span>
      )}
    </Link>
  )
}
