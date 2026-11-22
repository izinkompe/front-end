'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sprout,
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  Settings,
  ArrowLeft,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarNavItems = [
  { href: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { href: '/dashboard/komoditas', label: 'Komoditas & Panen', icon: Sprout },
  { href: '/dashboard/pesanan', label: 'Pesanan', icon: ShoppingBag },
  { href: '/dashboard/analitik', label: 'Analitik Pasar', icon: BarChart3 },
  { href: '/dashboard/pengaturan', label: 'Pengaturan', icon: Settings },
]

interface DashboardSidebarProps {
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export function DashboardSidebar({ mobileOpen = false, onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname()

  const content = (
    <div className='flex h-full flex-col justify-between p-4'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <Link
            href='/dashboard'
            className='flex items-center gap-2 font-bold text-sidebar-foreground hover:opacity-90 transition-opacity'
          >
            <span className='flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
              <Sprout className='size-5' />
            </span>
            <div className='flex flex-col'>
              <span className='text-sm leading-tight'>PanganTani</span>
              <span className='text-[10px] text-muted-foreground uppercase tracking-wider font-semibold'>
                Dashboard
              </span>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              type='button'
              onClick={onCloseMobile}
              className='md:hidden rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'
              aria-label='Tutup sidebar'
            >
              <X className='size-5' />
            </button>
          )}
        </div>

        <nav aria-label='Navigasi Dashboard' className='space-y-1'>
          {sidebarNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                )}
              >
                <Icon className='size-4 shrink-0' />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className='space-y-3 pt-4 border-t border-sidebar-border'>
        <Link
          href='/'
          className='flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'
        >
          <ArrowLeft className='size-4' />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className='flex items-center gap-3 rounded-lg bg-sidebar-accent/40 px-3 py-2.5'>
          <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold'>
            PT
          </div>
          <div className='flex flex-col min-w-0'>
            <span className='truncate text-xs font-semibold text-sidebar-foreground'>
              Petani Mitra
            </span>
            <span className='truncate text-[10px] text-muted-foreground'>petani@pangantani.id</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className='hidden md:flex md:w-64 md:flex-col md:shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground'>
        {content}
      </aside>

      {mobileOpen && (
        <div className='fixed inset-0 z-50 flex md:hidden'>
          <div
            className='fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity'
            onClick={onCloseMobile}
            aria-hidden='true'
          />
          <aside className='relative flex w-64 max-w-[80vw] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl'>
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
