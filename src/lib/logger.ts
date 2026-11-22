type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogPayload {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
}

function formatLog(payload: LogPayload): void {
  const prefix = '[' + payload.timestamp + '] [' + payload.level.toUpperCase() + ']'
  if (payload.level === 'error') {
    console.error(prefix, payload.message, payload.context || '')
  } else if (payload.level === 'warn') {
    console.warn(prefix, payload.message, payload.context || '')
  } else if (payload.level === 'info') {
    console.info(prefix, payload.message, payload.context || '')
  } else if (process.env.NODE_ENV !== 'production') {
    console.debug(prefix, payload.message, payload.context || '')
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    formatLog({
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString(),
    })
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    formatLog({
      level: 'warn',
      message,
      context,
      timestamp: new Date().toISOString(),
    })
  },
  error: (message: string, context?: Record<string, unknown>) => {
    formatLog({
      level: 'error',
      message,
      context,
      timestamp: new Date().toISOString(),
    })
  },
  debug: (message: string, context?: Record<string, unknown>) => {
    formatLog({
      level: 'debug',
      message,
      context,
      timestamp: new Date().toISOString(),
    })
  },
}
