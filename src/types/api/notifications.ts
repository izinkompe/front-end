import { z } from 'zod'

export const NotificationTypeSchema = z.enum([
  'order_update',
  'payment_reminder',
  'payment_verified',
  'schedule_proposal',
  'matched_offer',
  'system_alert',
])
export type NotificationType = z.infer<typeof NotificationTypeSchema>

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: NotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  link: z.string().optional(),
  isRead: z.boolean(),
  createdAt: z.string(),
})
export type Notification = z.infer<typeof NotificationSchema>
