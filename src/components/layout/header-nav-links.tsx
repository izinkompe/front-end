'use client'

import Link from 'next/link'
import {
  Apple,
  BookOpen,
  Carrot,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock,
  FileText,
  Leaf,
  Store,
  Wheat,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface HeaderNavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const categoryNavItems: ReadonlyArray<HeaderNavItem> = [
  { href: '/pasar/sayuran', label: 'Sayuran', icon: Leaf },
  { href: '/pasar/buah', label: 'Buah', icon: Apple },
  { href: '/pasar/padi-biji', label: 'Padi & Biji-bijian', icon: Wheat },
  { href: '/pasar/rempah-umbi', label: 'Rempah & Umbi', icon: Carrot },
]

export const primaryNavLinks: ReadonlyArray<HeaderNavItem> = [
  { href: '/pasar', label: 'Pasar Panen', icon: Store },
  { href: '/pasar?sort=expiring', label: 'Segera Ditutup', icon: Clock },
  { href: '/papan-kebutuhan', label: 'Papan Kebutuhan', icon: ClipboardList },
]

export const moreNavItems: ReadonlyArray<HeaderNavItem> = [
  { href: '/bantuan', label: 'Pusat Bantuan', icon: CircleHelp },
  { href: '/blog', label: 'Blog PanganTani', icon: BookOpen },
  { href: '/syarat', label: 'Syarat dan Ketentuan', icon: FileText },
]

export function DesktopMenuLink({
  item,
  isActive,
  onSelect,
}: {
  item: HeaderNavItem
  isActive: boolean
  onSelect: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onSelect}
      className={cn(
        'flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-popover-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon
        className={cn(
          'size-4 shrink-0',
          isActive ? 'text-primary dark:text-sidebar-primary' : 'text-muted-foreground'
        )}
        aria-hidden='true'
      />
      <span>{item.label}</span>
    </Link>
  )
}

export function MobileNavLink({
  item,
  isActive,
  onSelect,
}: {
  item: HeaderNavItem
  isActive: boolean
  onSelect: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onSelect}
      className={cn(
        'flex min-h-12 items-center justify-between rounded-md px-3.5 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-muted text-foreground'
          : 'text-foreground/85 hover:bg-muted hover:text-foreground'
      )}
    >
      <span className='flex items-center gap-2.5'>
        <Icon
          className={cn(
            'size-4.5 shrink-0',
            isActive ? 'text-primary dark:text-sidebar-primary' : 'text-muted-foreground'
          )}
          aria-hidden='true'
        />
        <span>{item.label}</span>
      </span>
      <ChevronRight className='size-4.5 text-muted-foreground' aria-hidden='true' />
    </Link>
  )
}
