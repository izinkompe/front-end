import { ApiError } from '../errors'
import { createUniqueId } from '@/lib/utils'
import { usersCollection } from './collections/users'
import {
  BuyerRegisterRequestSchema,
  ForgotPasswordRequestSchema,
  LoginRequestSchema,
  ResetPasswordRequestSchema,
  type User,
} from '@/types/api/auth'
import type { RouteContext } from './route-context'

const passwords = new Map<string, { salt: Uint8Array<ArrayBuffer>; digest: string }>()
const resetCodes = new Map<string, { code: string; expiresAt: number; attempts: number }>()
const resetDurationMs = 10 * 60 * 1000

function findUser(email: string) {
  return Array.from(usersCollection.values()).find((user) => user.email.toLowerCase() === email)
}

function fallbackMockHash(password: string, salt: Uint8Array<ArrayBuffer>): string {
  const input = `${Array.from(salt).join(',')}:${password}`
  let h1 = 0x811c9dc5
  let h2 = 0x9e3779b9
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 0x01000193)
    h2 = Math.imul(h2 ^ ch, 0x85ebca6b)
  }
  return `fallback:${(h1 >>> 0).toString(16)}:${(h2 >>> 0).toString(16)}`
}

async function hashPassword(password: string, salt: Uint8Array<ArrayBuffer>) {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return fallbackMockHash(password, salt)
  }
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const digest = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', iterations: 600_000, salt },
    key,
    256
  )
  return Array.from(new Uint8Array(digest)).join(',')
}

async function savePassword(user: User, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  passwords.set(user.id, { salt, digest: await hashPassword(password, salt) })
}

export async function handleBuyerAuthRoute({
  endpoint,
  method,
  body,
  parseJsonBody,
}: RouteContext) {
  if (method !== 'POST') return null

  if (endpoint === '/api/auth/login') {
    const result = LoginRequestSchema.safeParse(parseJsonBody(body))
    if (!result.success) throw new ApiError(400, 'Periksa email dan kata sandi', 'INVALID_LOGIN')
    const user = findUser(result.data.email.toLowerCase())
    if (user?.role === 'buyer') {
      const credential = passwords.get(user.id)
      const matches = credential
        ? credential.digest === (await hashPassword(result.data.password, credential.salt))
        : (user.id === 'usr-pb-01' || user.id === 'usr-pb-02') &&
          result.data.password === 'password123'
      if (matches) return { user }
    }
    throw new ApiError(401, 'Email atau kata sandi tidak sesuai', 'UNAUTHORIZED')
  }

  if (endpoint === '/api/auth/register') {
    const result = BuyerRegisterRequestSchema.safeParse(parseJsonBody(body))
    if (!result.success) throw new ApiError(400, 'Periksa data pendaftaran', 'INVALID_REGISTRATION')
    const { name, password } = result.data
    const email = result.data.email.toLowerCase()
    if (findUser(email))
      throw new ApiError(409, 'Email sudah terdaftar, silakan masuk', 'EMAIL_EXISTS')

    const now = new Date().toISOString()
    const user: User = {
      id: createUniqueId('usr-pb-'),
      name,
      email,
      phone: '',
      role: 'buyer',
      createdAt: now,
      updatedAt: now,
    }
    await savePassword(user, password)
    if (findUser(email)) {
      passwords.delete(user.id)
      throw new ApiError(409, 'Email sudah terdaftar, silakan masuk', 'EMAIL_EXISTS')
    }
    usersCollection.insert(user)
    return { user }
  }

  if (endpoint === '/api/auth/forgot-password') {
    const result = ForgotPasswordRequestSchema.safeParse(parseJsonBody(body))
    if (!result.success)
      throw new ApiError(400, 'Masukkan alamat email yang valid', 'INVALID_EMAIL')
    const email = result.data.email.toLowerCase()
    const now = Date.now()
    for (const [key, entry] of resetCodes) {
      if (entry.expiresAt <= now) resetCodes.delete(key)
    }
    const code = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000))
    resetCodes.set(email, { code, expiresAt: now + resetDurationMs, attempts: 0 })
    return { data: { success: true, demoCode: code } }
  }

  if (endpoint === '/api/auth/reset-password') {
    const result = ResetPasswordRequestSchema.safeParse(parseJsonBody(body))
    if (!result.success)
      throw new ApiError(400, 'Periksa kode dan kata sandi baru', 'INVALID_RESET')
    const email = result.data.email.toLowerCase()
    const entry = resetCodes.get(email)
    if (
      !entry ||
      entry.expiresAt <= Date.now() ||
      entry.attempts >= 5 ||
      entry.code !== result.data.code
    ) {
      if (entry) entry.attempts += 1
      throw new ApiError(
        400,
        'Kode tidak valid atau sudah kedaluwarsa. Minta kode baru.',
        'INVALID_RESET_CODE'
      )
    }
    resetCodes.delete(email)
    const user = findUser(email)
    if (user?.role === 'buyer') await savePassword(user, result.data.password)
    return { data: { success: true } }
  }

  return null
}
