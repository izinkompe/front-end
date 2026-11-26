import {
  BarChart3,
  ClipboardCheck,
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { hasPermission, type Permission } from '@/lib/auth/rbac'
import type { UserRole } from '@/types/api/auth'

export interface DashboardNavItem {
  title: string
  href: string
  icon: LucideIcon
  permission: Permission
}

export interface DashboardNavGroup {
  label: string
  items: ReadonlyArray<DashboardNavItem>
}

const FARMER_NAV_ITEMS: ReadonlyArray<DashboardNavItem> = [
  {
    title: 'Ringkasan',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'farmer:overview',
  },
  {
    title: 'Toko Saya',
    href: '/dashboard/toko',
    icon: Store,
    permission: 'farmer:store:manage',
  },
  {
    title: 'Kebun Saya',
    href: '/dashboard/kebun',
    icon: Sprout,
    permission: 'farmer:farms:manage',
  },
  {
    title: 'Penawaran Panen',
    href: '/dashboard/penawaran',
    icon: Package,
    permission: 'farmer:offers:manage',
  },
  {
    title: 'Pesanan Masuk',
    href: '/dashboard/pesanan',
    icon: ShoppingBasket,
    permission: 'farmer:orders:manage',
  },
]

const ADMIN_NAV_ITEMS: ReadonlyArray<DashboardNavItem> = [
  {
    title: 'Ringkasan Operasional',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'admin:overview',
  },
  {
    title: 'Verifikasi Petani',
    href: '/dashboard/admin/verifikasi',
    icon: ShieldCheck,
    permission: 'admin:farmers:verify',
  },
  {
    title: 'Moderasi Penawaran',
    href: '/dashboard/admin/moderasi',
    icon: ClipboardCheck,
    permission: 'admin:offers:moderate',
  },
  {
    title: 'Statistik Distribusi',
    href: '/dashboard/admin/statistik',
    icon: BarChart3,
    permission: 'admin:stats:view',
  },
  {
    title: 'Pengguna & Akses',
    href: '/dashboard/admin/pengguna',
    icon: Users,
    permission: 'admin:users:manage',
  },
]

export function getDashboardNavGroups(role: UserRole | null | undefined): DashboardNavGroup[] {
  if (!role) return []

  const groups: DashboardNavGroup[] = []

  const farmerItems = FARMER_NAV_ITEMS.filter((item) => hasPermission(role, item.permission))
  if (farmerItems.length > 0) {
    groups.push({ label: 'Pengelolaan Petani', items: farmerItems })
  }

  const adminItems = ADMIN_NAV_ITEMS.filter((item) => hasPermission(role, item.permission))
  if (adminItems.length > 0) {
    groups.push({ label: 'Operasional Admin', items: adminItems })
  }

  return groups
}

export function getDashboardPageTitle(pathname: string, role: UserRole | null | undefined): string {
  if (pathname === '/dashboard/akses-ditolak') {
    return 'Akses ditolak'
  }

  const allItems = [...FARMER_NAV_ITEMS, ...ADMIN_NAV_ITEMS]
  const matched = allItems.find((item) => {
    if (item.href === '/dashboard') {
      return pathname === '/dashboard' && hasPermission(role, item.permission)
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  })

  if (matched) return matched.title
  return role === 'admin' ? 'Ringkasan Operasional' : 'Ringkasan'
}
