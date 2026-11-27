import type { z } from 'zod'
import { ApiError } from './errors'
import { tanstackDbAdapter } from './db/adapter'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  silentStatuses?: number[]
}

const isMockEnabled = env.NEXT_PUBLIC_USE_MOCK

function normalizeBackendEndpoint(endpoint: string): string {
  if (endpoint === '/api/auth/me') return '/me'
  if (endpoint === '/api/auth/login-farmer' || endpoint === '/api/auth/login-admin') {
    return '/auth/login'
  }
  if (endpoint === '/api/auth/register-farmer') return '/auth/register'
  if (endpoint === '/api/profile') return '/me'
  if (endpoint.startsWith('/api/')) return endpoint.slice(4)
  return endpoint
}

function validateEndpoint(endpoint: string, baseUrl: string): URL {
  if (!endpoint.startsWith('/') || endpoint.startsWith('//')) {
    throw new ApiError(
      400,
      'Endpoint tidak valid: harus berupa path relatif yang diawali dengan satu karakter slash',
      'INVALID_ENDPOINT'
    )
  }

  const normalizedEndpoint = isMockEnabled ? endpoint : normalizeBackendEndpoint(endpoint)
  const base = baseUrl || 'http://localhost:8000/api/v1'
  const parsedBase = new URL(base)
  const expectedOrigin = parsedBase.origin
  const basePath = parsedBase.pathname.replace(/\/+$/, '')
  const resolvedUrl = new URL(`${expectedOrigin}${basePath}${normalizedEndpoint}`)

  if (resolvedUrl.origin !== expectedOrigin) {
    throw new ApiError(400, 'Origin endpoint tidak diizinkan', 'INVALID_ORIGIN')
  }

  return resolvedUrl
}

export async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return undefined
  }
  const text = await response.text()
  if (!text.trim()) {
    return undefined
  }
  return JSON.parse(text)
}

export async function apiClient<T>(
  endpoint: string,
  schema?: z.ZodType<T>,
  options: FetchOptions = {}
): Promise<T> {
  let rawData: unknown

  try {
    const url = validateEndpoint(endpoint, env.NEXT_PUBLIC_API_URL || '')

    if (isMockEnabled) {
      rawData = await tanstackDbAdapter.dispatch(endpoint, options)
    } else {
      const { params, headers, silentStatuses: _silentStatuses, ...restOptions } = options

      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined) {
            url.searchParams.set(key, String(val))
          }
        })
      }

      const isFormData = typeof FormData !== 'undefined' && restOptions.body instanceof FormData
      const mergedHeaders: Record<string, string> = {
        Accept: 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(headers as Record<string, string> | undefined),
      }

      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: mergedHeaders,
        ...restOptions,
      })

      if (!response.ok) {
        let errorData: { message?: string; code?: string; details?: unknown } = {}
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: response.statusText }
        }
        throw new ApiError(
          response.status,
          errorData.message || 'Terjadi kesalahan pada permintaan data',
          errorData.code || 'HTTP_' + response.status,
          errorData.details
        )
      }

      rawData = await parseResponseBody(response)
    }

    if (schema) {
      const parseResult = schema.safeParse(rawData)
      if (!parseResult.success) {
        throw new ApiError(
          500,
          'Format respons data tidak sesuai dengan skema yang diharapkan',
          'VALIDATION_ERROR',
          parseResult.error.format()
        )
      }
      return parseResult.data
    }

    return rawData as T
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err
    }
    const sanitizedEndpoint = endpoint.split('?')[0]
    const log = typeof window !== 'undefined' ? logger.warn.bind(logger) : logger.error.bind(logger)
    if (err instanceof ApiError) {
      if (!options.silentStatuses?.includes(err.status)) {
        log(
          {
            endpoint: sanitizedEndpoint,
            status: err.status,
            code: err.code,
          },
          'API Error: ' + err.message
        )
      }
    } else if (err instanceof Error) {
      log({ endpoint: sanitizedEndpoint }, 'Unexpected Error: ' + err.message)
    }
    throw err
  }
}
