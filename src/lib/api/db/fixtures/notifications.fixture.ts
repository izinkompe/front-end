import type { Notification } from '@/types/api/notifications'

export const mockNotificationsData: Notification[] = [
  {
    id: 'notif-001',
    userId: 'usr-pb-01',
    type: 'payment_reminder',
    title: 'Batas Waktu Pembayaran',
    message:
      'Segera selesaikan pembayaran untuk pesanan Tomat Ceri sebelum tenggat waktu 30 menit berakhir.',
    link: '/orders',
    isRead: false,
    createdAt: '2026-11-23T01:30:00Z',
  },
  {
    id: 'notif-002',
    userId: 'usr-pb-01',
    type: 'matched_offer',
    title: 'Penawaran Baru Cocok',
    message: 'Pak Joko baru saja menerbitkan penawaran Buncis Kenia di wilayah sekitar Anda.',
    link: '/offers/off-002',
    isRead: true,
    createdAt: '2026-11-22T09:15:00Z',
  },
]
