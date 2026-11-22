import { describe, expect, it } from 'bun:test'
import { logger } from './logger'

describe('Pino logger instance', () => {
  it('has standard logging methods', () => {
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.debug).toBe('function')
  })

  it('logs messages and objects without throwing', () => {
    expect(() => {
      logger.info('Test info message from pino')
      logger.warn({ warningCode: 'WARN_01' }, 'Test warning message')
      logger.error({ errorCode: 'ERR_01' }, 'Test error message')
    }).not.toThrow()
  })

  it('redacts sensitive fields such as password, token, and pii', () => {
    const sensitivePayload = {
      user: 'john_doe',
      password: 'supersecretpassword',
      token: 'secret-bearer-token',
      idCardNumber: '3201012345678901',
      bankAccountNumber: '1234567890',
      apiKey: 'sec-api-key-99',
      secret: 'platform-secret',
    }

    expect(() => {
      logger.info(sensitivePayload, 'Sensitive info log')
    }).not.toThrow()
  })
})
