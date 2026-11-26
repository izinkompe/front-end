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

export function requireFarmer(userId: string | null) {
  const user = userId ? usersCollection.get(userId) : undefined
  if (!user) throw new ApiError(401, 'Masuk sebagai petani untuk melanjutkan', 'UNAUTHORIZED')
  if (user.role !== 'farmer')
    throw new ApiError(403, 'Tindakan ini hanya untuk petani', 'FORBIDDEN')
  return user
}

export function requireAdmin(userId: string | null) {
  const user = userId ? usersCollection.get(userId) : undefined
  if (!user) throw new ApiError(401, 'Masuk sebagai admin untuk melanjutkan', 'UNAUTHORIZED')
  if (user.role !== 'admin')
    throw new ApiError(403, 'Tindakan ini hanya untuk admin operasional', 'FORBIDDEN')
  return user
}

export function requireRole<T extends string>(
  userId: string | null,
  allowedRoles: ReadonlyArray<T>
) {
  const user = userId ? usersCollection.get(userId) : undefined
  if (!user) throw new ApiError(401, 'Autentikasi diperlukan untuk melanjutkan', 'UNAUTHORIZED')
  if (!allowedRoles.includes(user.role as T)) {
    throw new ApiError(403, 'Anda tidak memiliki izin untuk mengakses sumber daya ini', 'FORBIDDEN')
  }
  return user
}
