import { describe, expect, it } from 'bun:test'
import { logger } from './logger'

describe('Application logger', () => {
  it('formats and outputs info log', () => {
    let called = false
    const originalInfo = console.info
    console.info = (...args) => {
      called = true
      originalInfo(...args)
    }

    logger.info('Test info message', { module: 'test' })
    console.info = originalInfo
    expect(called).toBe(true)
  })

  it('formats and outputs error log', () => {
    let called = false
    const originalError = console.error
    console.error = (...args) => {
      called = true
      originalError(...args)
    }

    logger.error('Test error message', { code: 'TEST_ERROR' })
    console.error = originalError
    expect(called).toBe(true)
  })

  it('formats and outputs warn log', () => {
    let called = false
    const originalWarn = console.warn
    console.warn = (...args) => {
      called = true
      originalWarn(...args)
    }

    logger.warn('Test warn message')
    console.warn = originalWarn
    expect(called).toBe(true)
  })
})
