import { z } from 'zod'

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_USE_MOCK: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val !== 'false'),
})

const mergedSchema = serverSchema.merge(clientSchema)

export type ServerEnv = z.infer<typeof serverSchema>
export type ClientEnv = z.infer<typeof clientSchema>
export type Env = z.infer<typeof mergedSchema>

function validateEnv(): Env {
  const isServer = typeof window === 'undefined'

  if (isServer) {
    const parsed = mergedSchema.safeParse(process.env)
    if (!parsed.success) {
      const formatted = parsed.error.format()
      console.error('Invalid environment variables:', formatted)
      throw new Error('Invalid environment variables: ' + JSON.stringify(formatted))
    }
    return parsed.data
  }

  const parsedClient = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK,
  })

  if (!parsedClient.success) {
    const formatted = parsedClient.error.format()
    console.error('Invalid client environment variables:', formatted)
    throw new Error('Invalid client environment variables: ' + JSON.stringify(formatted))
  }

  return {
    ...parsedClient.data,
    NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  } as Env
}

export const env = validateEnv()
