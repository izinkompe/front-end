import { afterEach, describe, expect, test } from 'bun:test'
import { getGeolocationErrorMessage, requestCurrentPosition } from './geolocation'

const originalNavigator = globalThis.navigator
const originalWindow = globalThis.window

afterEach(() => {
  Object.defineProperty(globalThis, 'navigator', {
    value: originalNavigator,
    configurable: true,
    writable: true,
  })
  Object.defineProperty(globalThis, 'window', {
    value: originalWindow,
    configurable: true,
    writable: true,
  })
})

describe('requestCurrentPosition', () => {
  test('returns insecure_context when window.isSecureContext is false', async () => {
    Object.defineProperty(globalThis, 'window', {
      value: { isSecureContext: false },
      configurable: true,
      writable: true,
    })

    const result = await requestCurrentPosition()
    expect(result).toEqual({ ok: false, reason: 'insecure_context' })
  })

  test('returns unsupported when navigator.geolocation is missing', async () => {
    Object.defineProperty(globalThis, 'window', {
      value: { isSecureContext: true },
      configurable: true,
      writable: true,
    })
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    })

    const result = await requestCurrentPosition()
    expect(result).toEqual({ ok: false, reason: 'unsupported' })
  })

  test('maps geolocation error codes accurately', async () => {
    Object.defineProperty(globalThis, 'window', {
      value: { isSecureContext: true },
      configurable: true,
      writable: true,
    })

    const cases = [
      { code: 1, expected: 'permission_denied' },
      { code: 2, expected: 'position_unavailable' },
      { code: 3, expected: 'timeout' },
    ]

    for (const item of cases) {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          geolocation: {
            getCurrentPosition: (_success, error) => {
              error({ code: item.code })
            },
          },
        },
        configurable: true,
        writable: true,
      })

      const result = await requestCurrentPosition()
      expect(result).toEqual({ ok: false, reason: item.expected })
    }
  })

  test('returns coordinates on success', async () => {
    Object.defineProperty(globalThis, 'window', {
      value: { isSecureContext: true },
      configurable: true,
      writable: true,
    })
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        geolocation: {
          getCurrentPosition: (success) => {
            success({ coords: { latitude: -6.5971, longitude: 106.806 } })
          },
        },
      },
      configurable: true,
      writable: true,
    })

    const result = await requestCurrentPosition()
    expect(result).toEqual({ ok: true, latitude: -6.5971, longitude: 106.806 })
  })
})

describe('getGeolocationErrorMessage', () => {
  test('distinguishes permission denied from timeout and insecure context', () => {
    expect(getGeolocationErrorMessage('permission_denied', 'buyer')).toContain('ditolak')
    expect(getGeolocationErrorMessage('timeout', 'buyer')).toContain('habis')
    expect(getGeolocationErrorMessage('insecure_context', 'farmer')).toContain('HTTPS')
  })
})
