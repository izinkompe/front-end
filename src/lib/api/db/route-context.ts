import { ApiError } from '../errors'
import { usersCollection } from './collections/users'

export interface RouteContext {
  endpoint: string
  method: string
  params?: Record<string, string | number | boolean | undefined>
  body: unknown
  activeSessionUserId: string | null
  parseJsonBody: <T = Record<string, unknown>>(body: unknown) => T
}

export function requireBuyer(userId: string | null) {
  const user = userId ? usersCollection.get(userId) : undefined
  if (!user) throw new ApiError(401, 'Masuk sebagai pembeli untuk melanjutkan', 'UNAUTHORIZED')
  if (user.role !== 'buyer')
    throw new ApiError(403, 'Tindakan ini hanya untuk pembeli', 'FORBIDDEN')
  return user
}
