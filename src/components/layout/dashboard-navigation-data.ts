import {
  LayoutDashboard,
  Sprout,
  ShoppingBag,
  ClipboardList,
  CreditCard,
  UserCheck,
  AlertTriangle,
  Leaf,
  FileDown,
  BadgeCheck,
} from 'lucide-react'
import type { NavMainItem } from './dashboard-sidebar-nav-main'

export type DashboardActor = 'farmer' | 'admin'

export interface ActorProfile {
  id: string
  name: string
  email: string
  roleTitle: string
  organization: string
  initials: string
  avatarUrl?: string
  badgeVariant: 'success' | 'info'
}

export const farmerProfile: ActorProfile = {
  id: 'usr-pt-01',
  name: 'Budi Santoso',
  email: 'budi@tani.id',
  roleTitle: 'Petani Mitra',
  organization: 'Kelompok Tani Lembang Mandiri',
  initials: 'BS',
  badgeVariant: 'success',
}

export const adminProfile: ActorProfile = {
  id: 'usr-admin-01',
  name: 'Siti Rahma',
  email: 'admin@pangantani.id',
  roleTitle: 'Administrator',
  organization: 'Operasional PanganTani',
  initials: 'SR',
  badgeVariant: 'info',
}

export const farmerNavItems: NavMainItem[] = [
  {
    title: 'Ringkasan Tani',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Komoditas & Panen',
    url: '/dashboard/komoditas',
    icon: Sprout,
    items: [
      { title: 'Daftar Hasil Panen', url: '/dashboard/komoditas' },
      { title: 'Tambah Penawaran', url: '/dashboard/komoditas/tambah' },
      { title: 'Jadwal Pengambilan', url: '/dashboard/komoditas/jadwal' },
    ],
  },
  {
    title: 'Pesanan Masuk',
    url: '/dashboard/pesanan',
    icon: ShoppingBag,
    items: [
      { title: 'Semua Pesanan', url: '/dashboard/pesanan' },
      { title: 'Siap Diambil', url: '/dashboard/pesanan?status=ready' },
      { title: 'Riwayat Penyaluran', url: '/dashboard/pesanan/riwayat' },
    ],
  },
  {
    title: 'Papan Kebutuhan',
    url: '/dashboard/kebutuhan',
    icon: ClipboardList,
    items: [
      { title: 'Daftar Permintaan', url: '/dashboard/kebutuhan' },
      { title: 'Respons Saya', url: '/dashboard/kebutuhan/respons' },
    ],
  },
  {
    title: 'Verifikasi Akun',
    url: '/dashboard/verifikasi',
    icon: BadgeCheck,
  },
]

export const adminNavItems: NavMainItem[] = [
  {
    title: 'Ringkasan Operasional',
    url: '/dashboard/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Verifikasi Pembayaran',
    url: '/dashboard/admin/verifikasi-pembayaran',
    icon: CreditCard,
    items: [
      { title: 'Antrean Bukti Transfer', url: '/dashboard/admin/verifikasi-pembayaran' },
      { title: 'Riwayat Verifikasi', url: '/dashboard/admin/verifikasi-pembayaran?tab=history' },
    ],
  },
  {
    title: 'Verifikasi Petani',
    url: '/dashboard/admin/verifikasi-petani',
    icon: UserCheck,
    items: [
      { title: 'Pengajuan Berkas', url: '/dashboard/admin/verifikasi-petani' },
      { title: 'Petani Disetujui', url: '/dashboard/admin/verifikasi-petani?tab=approved' },
    ],
  },
  {
    title: 'Pengaduan & Masalah',
    url: '/dashboard/admin/pengaduan',
    icon: AlertTriangle,
    items: [
      { title: 'Laporan Terbuka', url: '/dashboard/admin/pengaduan' },
      { title: 'Penyelesaian & Refund', url: '/dashboard/admin/pengaduan?tab=refunds' },
    ],
  },
  {
    title: 'Faktor Emisi Karbon',
    url: '/dashboard/admin/emisi-karbon',
    icon: Leaf,
    items: [
      { title: 'Tabel Faktor Emisi', url: '/dashboard/admin/emisi-karbon' },
      { title: 'Metodologi & Sumber', url: '/dashboard/admin/emisi-karbon#metodologi' },
    ],
  },
  {
    title: 'Ekspor Laporan',
    url: '/dashboard/admin/laporan',
    icon: FileDown,
    items: [
      { title: 'Unduh Berkas CSV', url: '/dashboard/admin/laporan' },
      { title: 'Rekapitulasi Distribusi', url: '/dashboard/admin/laporan#rekap' },
    ],
  },
]

export function getDashboardActor(pathname?: string | null): DashboardActor {
  if (pathname && pathname.startsWith('/dashboard/admin')) {
    return 'admin'
  }
  return 'farmer'
}

export function getBreadcrumbTrail(
  pathname?: string | null
): Array<{ label: string; href?: string }> {
  const safePath = pathname || ''
  if (safePath.startsWith('/dashboard/admin')) {
    const base = [
      { label: 'Dashboard', href: '/dashboard/admin' },
      { label: 'Admin', href: '/dashboard/admin' },
    ]

    if (safePath === '/dashboard/admin') {
      return [...base, { label: 'Ringkasan' }]
    }
    if (safePath.startsWith('/dashboard/admin/verifikasi-pembayaran')) {
      return [...base, { label: 'Verifikasi Pembayaran' }]
    }
    if (safePath.startsWith('/dashboard/admin/verifikasi-petani')) {
      return [...base, { label: 'Verifikasi Petani' }]
    }
    if (safePath.startsWith('/dashboard/admin/pengaduan')) {
      return [...base, { label: 'Pengaduan & Masalah' }]
    }
    if (safePath.startsWith('/dashboard/admin/emisi-karbon')) {
      return [...base, { label: 'Faktor Emisi Karbon' }]
    }
    if (safePath.startsWith('/dashboard/admin/laporan')) {
      return [...base, { label: 'Ekspor Laporan' }]
    }
    return base
  }

  const base = [{ label: 'Dashboard', href: '/dashboard' }]

  if (safePath === '/dashboard') {
    return [...base, { label: 'Ringkasan Tani' }]
  }
  if (safePath.startsWith('/dashboard/komoditas')) {
    return [...base, { label: 'Komoditas & Panen' }]
  }
  if (safePath.startsWith('/dashboard/pesanan')) {
    return [...base, { label: 'Pesanan Masuk' }]
  }
  if (safePath.startsWith('/dashboard/kebutuhan')) {
    return [...base, { label: 'Papan Kebutuhan' }]
  }
  if (safePath.startsWith('/dashboard/verifikasi')) {
    return [...base, { label: 'Verifikasi Akun' }]
  }
  if (safePath.startsWith('/dashboard/pengaturan')) {
    return [...base, { label: 'Pengaturan' }]
  }
  return base
}
