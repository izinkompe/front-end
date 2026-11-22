import { createCollection, localOnlyCollectionOptions } from '@tanstack/react-db'
import { UserSchema } from '@/types/api/auth'
import { mockUsersData } from '../fixtures/users.fixture'

export const usersCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'users',
    schema: UserSchema,
    getKey: (item) => item.id,
    initialData: mockUsersData,
  })
)
