import { ApiError } from '../errors'
import { usersCollection } from './collections/users'
import { AccountPreferencesSchema, type User } from '@/types/api/auth'
import { saveBuyerPreferences } from './buyer-preferences'

interface ProfileRouteContext {
  endpoint: string
  method: string
  body: unknown
  activeSessionUserId: string | null
  parseJsonBody: <T = Record<string, unknown>>(body: unknown) => T
}

export function handleProfileRoute(ctx: ProfileRouteContext): { handled: boolean; data?: unknown } {
  const { endpoint, method, body, activeSessionUserId, parseJsonBody } = ctx

  if (endpoint === '/api/auth/addresses' && method === 'POST') {
    if (!activeSessionUserId) {
      throw new ApiError(401, 'Masuk terlebih dahulu untuk mengubah alamat', 'UNAUTHORIZED')
    }
    const user = usersCollection.get(activeSessionUserId)
    if (!user) {
      throw new ApiError(404, 'Akun pengguna tidak ditemukan', 'NOT_FOUND')
    }

    const payload = parseJsonBody<{
      id?: string
      label?: string
      areaName?: string
      fullAddress?: string
      setAsDefault?: boolean
    }>(body)

    const label = (payload.label || '').trim()
    const areaName = (payload.areaName || '').trim()
    const fullAddress = (payload.fullAddress || '').trim()
    if (label.length < 2 || areaName.length < 3 || fullAddress.length < 8) {
      throw new ApiError(400, 'Lengkapi label, wilayah, dan alamat lengkap', 'INVALID_ADDRESS')
    }

    const currentAddresses = user.addresses ?? []
    const existingIndex = payload.id
      ? currentAddresses.findIndex((item) => item.id === payload.id)
      : -1
    const shouldBeDefault = payload.setAsDefault ?? true
    const addressId = existingIndex >= 0 ? currentAddresses[existingIndex].id : 'addr-' + Date.now()

    const nextAddress = {
      id: addressId,
      label,
      areaName,
      fullAddress,
      latitude: existingIndex >= 0 ? currentAddresses[existingIndex].latitude : -6.9175,
      longitude: existingIndex >= 0 ? currentAddresses[existingIndex].longitude : 107.6191,
      isDefault: shouldBeDefault,
    }

    const nextAddresses =
      existingIndex >= 0
        ? currentAddresses.map((item, index) =>
            index === existingIndex
              ? nextAddress
              : shouldBeDefault
                ? { ...item, isDefault: false }
                : item
          )
        : [
            ...currentAddresses.map((item) =>
              shouldBeDefault ? { ...item, isDefault: false } : item
            ),
            nextAddress,
          ]

    usersCollection.update(user.id, (draft) => {
      draft.addresses = nextAddresses
      draft.updatedAt = new Date().toISOString()
    })

    return { handled: true, data: usersCollection.get(user.id) }
  }

  if (endpoint.startsWith('/api/auth/addresses/') && method === 'DELETE') {
    if (!activeSessionUserId) {
      throw new ApiError(401, 'Masuk terlebih dahulu untuk menghapus alamat', 'UNAUTHORIZED')
    }
    const user = usersCollection.get(activeSessionUserId)
    if (!user) {
      throw new ApiError(404, 'Akun pengguna tidak ditemukan', 'NOT_FOUND')
    }

    let addressId: string
    try {
      addressId = decodeURIComponent(endpoint.replace('/api/auth/addresses/', ''))
    } catch {
      throw new ApiError(400, 'ID alamat tidak valid', 'INVALID_ADDRESS_ID')
    }
    const currentAddresses = user.addresses ?? []
    const target = currentAddresses.find((item) => item.id === addressId)
    if (!target) {
      throw new ApiError(404, 'Alamat tidak ditemukan', 'NOT_FOUND')
    }

    const remaining = currentAddresses.filter((item) => item.id !== addressId)
    const nextAddresses =
      target.isDefault && remaining.length > 0
        ? remaining.map((item, index) => (index === 0 ? { ...item, isDefault: true } : item))
        : remaining

    usersCollection.update(user.id, (draft) => {
      draft.addresses = nextAddresses
      draft.updatedAt = new Date().toISOString()
    })

    return { handled: true, data: usersCollection.get(user.id) }
  }

  if (endpoint === '/api/profile' && method === 'PATCH') {
    if (!activeSessionUserId) {
      throw new ApiError(401, 'Masuk terlebih dahulu untuk mengubah profil', 'UNAUTHORIZED')
    }
    const user = usersCollection.get(activeSessionUserId)
    if (!user) {
      throw new ApiError(404, 'Akun pengguna tidak ditemukan', 'NOT_FOUND')
    }

    const payload = parseJsonBody<{
      name?: string
      phone?: string
      organization?: string
      avatarUrl?: string | null
      preferences?: User['preferences']
    }>(body)

    const nextName = payload.name !== undefined ? payload.name.trim() : user.name
    if (nextName.length < 2) {
      throw new ApiError(400, 'Nama lengkap minimal 2 karakter', 'INVALID_PROFILE')
    }

    const nextPhone =
      payload.phone !== undefined ? payload.phone.trim().replace(/[\s-]/g, '') : user.phone
    if (nextPhone && !/^(?:\+62|62|0)8\d{7,12}$/.test(nextPhone)) {
      throw new ApiError(400, 'Format nomor WhatsApp tidak valid', 'INVALID_PHONE')
    }

    const nextOrg =
      payload.organization !== undefined
        ? payload.organization.trim() || undefined
        : user.organization

    let nextAvatarUrl = user.avatarUrl
    if (payload.avatarUrl === null) {
      nextAvatarUrl = undefined
    } else if (typeof payload.avatarUrl === 'string') {
      const trimmedAvatar = payload.avatarUrl.trim()
      let isValidHttps = false
      if (trimmedAvatar.startsWith('https://')) {
        try {
          isValidHttps = new URL(trimmedAvatar).protocol === 'https:'
        } catch {
          isValidHttps = false
        }
      }
      if (
        trimmedAvatar.length <= 3_000_000 &&
        (/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(trimmedAvatar) ||
          /^\/images\/[a-zA-Z0-9/_-]+\.(?:png|jpe?g|webp)$/.test(trimmedAvatar) ||
          isValidHttps)
      ) {
        nextAvatarUrl = trimmedAvatar
      } else {
        throw new ApiError(400, 'Format foto profil tidak didukung', 'INVALID_AVATAR')
      }
    }

    if (
      payload.preferences !== undefined &&
      !AccountPreferencesSchema.safeParse(payload.preferences).success
    ) {
      throw new ApiError(400, 'Pilihan pengaturan tidak valid', 'INVALID_PREFERENCES')
    }

    const phoneChanged = payload.phone !== undefined && nextPhone !== user.phone

    usersCollection.update(user.id, (draft) => {
      draft.name = nextName
      draft.phone = nextPhone
      draft.organization = nextOrg
      draft.avatarUrl = nextAvatarUrl
      if (phoneChanged) {
        draft.isPhoneVerified = false
      }
      if (payload.preferences) {
        draft.preferences = payload.preferences
      }
      draft.updatedAt = new Date().toISOString()
    })

    const updated = usersCollection.get(user.id)
    if (updated?.role === 'buyer' && payload.preferences) saveBuyerPreferences(updated)
    return { handled: true, data: updated }
  }

  if (endpoint === '/api/profile/verify-phone' && method === 'POST') {
    if (!activeSessionUserId) {
      throw new ApiError(401, 'Masuk terlebih dahulu untuk memverifikasi nomor', 'UNAUTHORIZED')
    }
    const user = usersCollection.get(activeSessionUserId)
    if (!user) {
      throw new ApiError(404, 'Akun pengguna tidak ditemukan', 'NOT_FOUND')
    }

    const payload = parseJsonBody<{ phone?: string; otpCode?: string }>(body)
    const normalizedPhone = (payload.phone || '').trim().replace(/[\s-]/g, '')
    const otpCode = (payload.otpCode || '').trim()

    if (!/^(?:\+62|62|0)8\d{7,12}$/.test(normalizedPhone)) {
      throw new ApiError(400, 'Format nomor WhatsApp tidak valid', 'INVALID_PHONE')
    }
    if (!/^\d{6}$/.test(otpCode)) {
      throw new ApiError(400, 'Kode verifikasi harus berisi 6 angka', 'INVALID_OTP')
    }

    usersCollection.update(user.id, (draft) => {
      draft.phone = normalizedPhone
      draft.isPhoneVerified = true
      draft.updatedAt = new Date().toISOString()
    })

    return { handled: true, data: usersCollection.get(user.id) }
  }

  return { handled: false }
}
