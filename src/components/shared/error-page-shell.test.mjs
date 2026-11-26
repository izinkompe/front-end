import { expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ERROR_PRESETS, resolveErrorPreset } from '../../lib/data/error-presets.ts'
import { ErrorPageShell } from './error-page-shell.tsx'

test('resolves common HTTP, auth, session, and network errors to presets', () => {
  expect(resolveErrorPreset({ status: 400 })).toBe('400')
  expect(resolveErrorPreset({ status: 401 })).toBe('401')
  expect(resolveErrorPreset({ code: 'UNAUTHENTICATED' })).toBe('401')
  expect(resolveErrorPreset({ code: 'SESSION_EXPIRED' })).toBe('session-expired')
  expect(resolveErrorPreset({ status: 403 })).toBe('403')
  expect(resolveErrorPreset({ status: 404 })).toBe('404')
  expect(resolveErrorPreset({ status: 408 })).toBe('408')
  expect(resolveErrorPreset({ status: 429 })).toBe('429')
  expect(resolveErrorPreset({ status: 503 })).toBe('503')
  expect(resolveErrorPreset(new TypeError('Failed to fetch'))).toBe('offline')
  expect(resolveErrorPreset(new Error('Unexpected'))).toBe('500')
})

test('provides complete Indonesian copy for every error preset', () => {
  for (const [key, preset] of Object.entries(ERROR_PRESETS)) {
    expect(preset.code.length).toBeGreaterThan(0)
    expect(preset.title.length).toBeGreaterThan(0)
    expect(preset.description.length).toBeGreaterThan(0)
    expect(preset.primaryAction.label.length).toBeGreaterThan(0)
    expect(key.length).toBeGreaterThan(0)
  }
})

test('renders standalone 401 and 403 error shells without GlobalLayout when disabled', () => {
  const unauthHtml = renderToStaticMarkup(
    createElement(ErrorPageShell, {
      variant: '401',
      withGlobalLayout: false,
    })
  )
  expect(unauthHtml).toContain('401')
  expect(unauthHtml).toContain('Belum masuk akun')
  expect(unauthHtml).toContain('Masuk Petani')

  const forbiddenHtml = renderToStaticMarkup(
    createElement(ErrorPageShell, {
      variant: '403',
      withGlobalLayout: false,
    })
  )
  expect(forbiddenHtml).toContain('403')
  expect(forbiddenHtml).toContain('Akses ditolak')
  expect(forbiddenHtml).toContain('kredensial')
})

test('renders retry action when onRetry is provided', () => {
  const html = renderToStaticMarkup(
    createElement(ErrorPageShell, {
      variant: '500',
      withGlobalLayout: false,
      onRetry: () => {},
    })
  )

  expect(html).toContain('500')
  expect(html).toContain('Coba lagi')
  expect(html).toContain('Kembali ke beranda')
})
