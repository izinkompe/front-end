import type { z } from 'zod'
import { ApiError } from './errors'
import { tanstackDbAdapter } from './db/adapter'

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

const isMockEnabled = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'

export async function apiClient<T>(
  endpoint: string,
  schema?: z.ZodType<T>,
  options: FetchOptions = {}
): Promise<T> {
  let rawData: unknown

  if (isMockEnabled) {
    rawData = await tanstackDbAdapter.dispatch(endpoint, options)
  } else {
    const { params, headers, ...restOptions } = options
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
    const url = new URL(endpoint, baseUrl || 'http://localhost:3000')

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
}
