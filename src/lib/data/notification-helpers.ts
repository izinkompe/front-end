import type { NotificationType } from '@/types/api/notifications'

export function getNotificationHref(path?: string) {
  if (!path) return undefined
  if (/^\/(?:akun(?:\/(?:notifikasi|pengaduan|transaksi))?|favorit|pasar)$/.test(path)) return path
  if (
    /^\/(?:pesanan\/[\w-]+(?:\/bayar)?|pasar\/penawaran\/[\w-]+|papan-kebutuhan(?:\?request=[\w-]+)?|dashboard(?:\/(?:toko|kebun|penawaran|pesanan|papan-kebutuhan)(?:\?[\w=&-]+)?)?)$/.test(
      path
    )
  )
    return path
  return undefined
}

export const notificationCategories = ['Pembayaran', 'Pesanan', 'Penawaran', 'Sistem'] as const
export type NotificationCategory = (typeof notificationCategories)[number]

export const notificationCategoryByType = {
  payment_reminder: 'Pembayaran',
  payment_verified: 'Pembayaran',
  order_update: 'Pesanan',
  schedule_proposal: 'Pesanan',
  matched_offer: 'Penawaran',
  system_alert: 'Sistem',
} satisfies Record<NotificationType, NotificationCategory>
