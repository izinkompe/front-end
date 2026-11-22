import { describe, expect, it } from 'bun:test'
import { getQueryClient } from './query-client'
import { ApiError } from './errors'

describe('QueryClient security configuration', () => {
  it('disables mutation auto-retry by default', () => {
    const client = getQueryClient()
    const defaultOptions = client.getDefaultOptions()
    expect(defaultOptions.mutations?.retry).toBe(false)
  })

  it('configures query retry policy safely', () => {
    const client = getQueryClient()
    const defaultOptions = client.getDefaultOptions()
    const retryFn = defaultOptions.queries?.retry

    expect(typeof retryFn).toBe('function')
    if (typeof retryFn === 'function') {
      const clientError = new ApiError(404, 'Not found')
      expect(retryFn(0, clientError)).toBe(false)

      const serverError = new ApiError(500, 'Server error')
      expect(retryFn(0, serverError)).toBe(true)
      expect(retryFn(1, serverError)).toBe(false)
    }
  })

  it('configures sensible staleTime and gcTime', () => {
    const client = getQueryClient()
    const defaultOptions = client.getDefaultOptions()
    expect(defaultOptions.queries?.staleTime).toBe(60 * 1000)
    expect(defaultOptions.queries?.gcTime).toBe(5 * 60 * 1000)
  })
})
