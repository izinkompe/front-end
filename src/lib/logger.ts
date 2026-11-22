import pino from 'pino'
import { env } from './env'

export const logger = pino({
  level: env.LOG_LEVEL || (env.NODE_ENV === 'production' ? 'info' : 'debug'),
  browser: {
    asObject: true,
  },
  redact: ['password', '*.password', 'token', '*.token', 'authorization'],
})

export type Logger = typeof logger
