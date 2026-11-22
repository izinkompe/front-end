import { describe, expect, it } from 'bun:test'
import { env } from './env'

describe('Environment validation', () => {
  it('validates loaded environment variables successfully', () => {
    expect(env.NODE_ENV).toBeDefined()
    expect(['development', 'production', 'test']).toContain(env.NODE_ENV)
    expect(typeof env.NEXT_PUBLIC_USE_MOCK).toBe('boolean')
  })

  it('provides default values for app url', () => {
    expect(env.NEXT_PUBLIC_APP_URL).toBeDefined()
    expect(env.NEXT_PUBLIC_APP_URL.startsWith('http')).toBe(true)
  })
})
