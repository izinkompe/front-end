import { createCollection, localOnlyCollectionOptions } from '@tanstack/react-db'
import { NotificationSchema } from '@/types/api/notifications'
import { mockNotificationsData } from '../fixtures/notifications.fixture'

export const notificationsCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'notifications',
    schema: NotificationSchema,
    getKey: (item) => item.id,
    initialData: mockNotificationsData,
  })
)
