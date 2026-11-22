'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

export interface BreadcrumbCrumb {
  label: string
  href?: string
}

interface GlobalBreadcrumbProps {
  items?: BreadcrumbCrumb[]
  className?: string
}

const routeLabelMap: Record<string, string> = {
  '': 'Beranda',
  pasar: 'Pasar Pangan',
  edukasi: 'Edukasi Tani',
  tentang: 'Tentang Kami',
  dashboard: 'Dashboard',
  admin: 'Admin',
  komoditas: 'Komoditas & Panen',
  tambah: 'Tambah Panen',
  jadwal: 'Jadwal Pengambilan',
  pesanan: 'Pesanan Masuk',
  riwayat: 'Riwayat Penyaluran',
  kebutuhan: 'Papan Kebutuhan',
  verifikasi: 'Verifikasi Akun',
  pengaturan: 'Pengaturan Profil',
  'verifikasi-pembayaran': 'Verifikasi Pembayaran',
  'verifikasi-petani': 'Verifikasi Petani',
  pengaduan: 'Pengaduan & Masalah',
  'emisi-karbon': 'Faktor Emisi Karbon',
  laporan: 'Ekspor Laporan',
}

export function generateBreadcrumbsFromPath(pathname: string): BreadcrumbCrumb[] {
  if (!pathname || pathname === '/') {
    return [{ label: 'Beranda' }]
  }

  if (pathname.startsWith('/dashboard/admin')) {
    const base: BreadcrumbCrumb[] = [
      { label: 'Dashboard', href: '/dashboard/admin' },
      { label: 'Admin', href: '/dashboard/admin' },
    ]

    if (pathname === '/dashboard/admin') {
      return [...base, { label: 'Ringkasan Operasional' }]
    }

    const subSegment = pathname.replace('/dashboard/admin/', '').split('/')[0]
    const label = routeLabelMap[subSegment] || subSegment
    return [...base, { label }]
  }

  if (pathname.startsWith('/dashboard')) {
    const base: BreadcrumbCrumb[] = [{ label: 'Dashboard', href: '/dashboard' }]

    if (pathname === '/dashboard') {
      return [...base, { label: 'Ringkasan Tani' }]
    }

    const segments = pathname.replace('/dashboard/', '').split('/').filter(Boolean)
    let currentPath = '/dashboard'

    segments.forEach((seg, index) => {
      currentPath += `/${seg}`
      const isLast = index === segments.length - 1
      const label = routeLabelMap[seg] || seg
      base.push({
        label,
        href: isLast ? undefined : currentPath,
      })
    })

    return base
  }

  const segments = pathname.split('/').filter(Boolean)
  const crumbs: BreadcrumbCrumb[] = [{ label: 'Beranda', href: '/' }]
  let currentPath = ''

  segments.forEach((seg, index) => {
    currentPath += `/${seg}`
    const isLast = index === segments.length - 1
    const label = routeLabelMap[seg] || (seg.startsWith('off-') ? 'Detail Komoditas' : seg)
    crumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    })
  })

  return crumbs
}

export function GlobalBreadcrumb({ items, className }: GlobalBreadcrumbProps) {
  const pathname = usePathname()
  const crumbs = items && items.length > 0 ? items : generateBreadcrumbsFromPath(pathname)

  if (crumbs.length === 0) {
    return null
  }

  return (
    <Breadcrumb className={cn('min-w-0', className)}>
      <BreadcrumbList className='flex-nowrap overflow-hidden text-xs sm:text-sm text-muted-foreground'>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1

          return (
            <React.Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className='min-w-0'>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className='truncate font-medium text-foreground max-w-[120px] sm:max-w-[220px] md:max-w-none'>
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={crumb.href} />}
                    className='truncate max-w-[90px] sm:max-w-[140px] md:max-w-none'
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
