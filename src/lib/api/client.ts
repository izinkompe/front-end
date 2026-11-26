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

function validateEndpoint(endpoint: string, baseUrl: string): URL {
  if (!endpoint.startsWith('/') || endpoint.startsWith('//')) {
    throw new ApiError(
      400,
      'Endpoint tidak valid: harus berupa path relatif yang diawali dengan satu karakter slash',
      'INVALID_ENDPOINT'
    )
  }

  const base = baseUrl || 'http://localhost:3000'
  const expectedOrigin = new URL(base).origin
  const resolvedUrl = new URL(endpoint, expectedOrigin)

  if (resolvedUrl.origin !== expectedOrigin) {
    throw new ApiError(400, 'Origin endpoint tidak diizinkan', 'INVALID_ORIGIN')
  }

  return resolvedUrl
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

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
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

      rawData = await response.json()
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
    const sanitizedEndpoint = endpoint.split('?')[0]
    if (err instanceof ApiError) {
      if (!options.silentStatuses?.includes(err.status)) {
        logger.error(
          {
            endpoint: sanitizedEndpoint,
            status: err.status,
            code: err.code,
          },
          'API Error: ' + err.message
        )
      }
    } else if (err instanceof Error) {
      logger.error({ endpoint: sanitizedEndpoint }, 'Unexpected Error: ' + err.message)
    }
    throw err
  }
}
