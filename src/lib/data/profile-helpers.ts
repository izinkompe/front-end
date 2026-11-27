import {
  UpdateProfileRequestSchema,
  type AccountPreferences,
  type User,
  type UserRole,
} from '@/types/api/auth'
import type { Order, OrderStatus } from '@/types/api/orders'

export interface ProfileCompletionSummary {
  percentage: number
  completedCount: number
  totalCount: number
  missingLabels: string[]
  nextStepText: string | null
}

export interface ProfileFormErrors {
  name?: string
  phone?: string
  organization?: string
}

export type AccountOrdersTab = 'aktif' | 'riwayat'

export const DEFAULT_ACCOUNT_PREFERENCES: AccountPreferences = {
  orderStatusUpdates: true,
  harvestReminders: true,
  marketingEmails: false,
  showOrganizationOnReceipts: true,
}

const ACTIVE_ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set([
  'pending_payment',
  'payment_submitted',
  'processing',
  'ready_for_pickup',
  'disputed',
])

const HISTORY_ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set([
  'pending_payment',
  'payment_submitted',
  'processing',
  'ready_for_pickup',
  'disputed',
  'completed',
  'cancelled',
])

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatUserRoleLabel(role: UserRole): string {
  if (role === 'farmer') return 'Petani Mitra'
  if (role === 'admin') return 'Admin Operasional'
  return 'Pembeli'
}

export function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'PT'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function isSafeAvatarUrl(candidate?: string | null): string | null {
  if (!candidate) return null
  const trimmed = candidate.trim()
  if (!trimmed) return null

  if (/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(trimmed)) {
    return trimmed
  }
  if (trimmed.startsWith('blob:')) {
    return trimmed
  }
  if (/^\/images\/[a-zA-Z0-9/_-]+\.(?:png|jpe?g|webp)$/.test(trimmed)) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'https:') {
      return parsed.toString()
    }
  } catch {
    return null
  }

  return null
}

export function calculateProfileCompletion(user: User): ProfileCompletionSummary {
  const checks: Array<{ label: string; ok: boolean }> = [
    { label: 'Nama lengkap', ok: user.name.trim().length >= 2 },
    { label: 'Alamat email', ok: user.email.trim().length > 0 },
    { label: 'Nomor WhatsApp', ok: user.phone.trim().length >= 9 },
    {
      label:
        user.role === 'farmer' ? 'Nama kebun atau kelompok tani' : 'Nama usaha atau organisasi',
      ok: Boolean(user.organization?.trim()),
    },
    { label: 'Alamat utama tersimpan', ok: (user.addresses?.length ?? 0) > 0 },
  ]

  const completedCount = checks.filter((item) => item.ok).length
  const totalCount = checks.length
  const percentage = Math.round((completedCount / totalCount) * 100)
  const missingLabels = checks.filter((item) => !item.ok).map((item) => item.label)
  const nextStepText =
    missingLabels.length > 0 ? `Lengkapi ${missingLabels[0].toLowerCase()}` : null

  return {
    percentage,
    completedCount,
    totalCount,
    missingLabels,
    nextStepText,
  }
}

export function validateProfileFormInput(input: {
  name: string
  phone: string
  organization: string
}): ProfileFormErrors {
  const parsed = UpdateProfileRequestSchema.safeParse({
    name: input.name,
    phone: input.phone.trim().replace(/[\s-]/g, ''),
    organization: input.organization,
  })

  if (parsed.success) {
    return {}
  }

  const errors: ProfileFormErrors = {}
  for (const issue of parsed.error.issues) {
    const field = issue.path[0]
    if (field === 'name' && !errors.name) errors.name = issue.message
    if (field === 'phone' && !errors.phone) errors.phone = issue.message
    if (field === 'organization' && !errors.organization) errors.organization = issue.message
  }
  return errors
}

export function filterAccountOrders(
  orders: ReadonlyArray<Order>,
  options: {
    tab: AccountOrdersTab
    query?: string
    statusFilter?: OrderStatus | 'all'
    userId?: string
  }
): Order[] {
  const normalizedQuery = (options.query ?? '').trim().toLowerCase()
  const targetStatuses = options.tab === 'aktif' ? ACTIVE_ORDER_STATUSES : HISTORY_ORDER_STATUSES

  return orders
    .filter((order) => {
      if (options.userId && order.buyerId !== options.userId && order.farmerId !== options.userId) {
        return false
      }
      if (!targetStatuses.has(order.status)) {
        return false
      }
      if (options.statusFilter && options.statusFilter !== 'all') {
        if (order.status !== options.statusFilter) return false
      }
      if (normalizedQuery) {
        const haystacks = [
          order.commodityName,
          order.id,
          order.farmerName ?? '',
          order.buyerOrganization ?? '',
        ]
        if (!haystacks.some((value) => value.toLowerCase().includes(normalizedQuery))) {
          return false
        }
      }
      return true
    })
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
}

export function filterAccountTransactions(
  orders: ReadonlyArray<Order>,
  options: {
    query?: string
    fromDate?: Date | null
    toDate?: Date | null
    userId?: string
  }
): Order[] {
  const normalizedQuery = (options.query ?? '').trim().toLowerCase()
  const fromMs = options.fromDate
    ? new Date(
        options.fromDate.getFullYear(),
        options.fromDate.getMonth(),
        options.fromDate.getDate(),
        0,
        0,
        0,
        0
      ).getTime()
    : null
  const toMs = options.toDate
    ? new Date(
        options.toDate.getFullYear(),
        options.toDate.getMonth(),
        options.toDate.getDate(),
        23,
        59,
        59,
        999
      ).getTime()
    : null

  return orders
    .filter((order) => {
      if (options.userId && order.buyerId !== options.userId && order.farmerId !== options.userId) {
        return false
      }
      const createdMs = Date.parse(order.createdAt)
      if (fromMs !== null && Number.isFinite(createdMs) && createdMs < fromMs) {
        return false
      }
      if (toMs !== null && Number.isFinite(createdMs) && createdMs > toMs) {
        return false
      }
      if (normalizedQuery) {
        const matches =
          order.commodityName.toLowerCase().includes(normalizedQuery) ||
          order.id.toLowerCase().includes(normalizedQuery) ||
          (order.farmerName ?? '').toLowerCase().includes(normalizedQuery)
        if (!matches) return false
      }
      return true
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

export function formatShortDateId(isoOrDate: string | Date): string {
  const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate)
  if (Number.isNaN(date.getTime())) {
    return typeof isoOrDate === 'string' ? isoOrDate : '-'
  }
  return shortDateFormatter.format(date)
}
