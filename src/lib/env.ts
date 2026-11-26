import { z } from 'zod'

const httpUrlSchema = z
  .string()
  .url()
  .refine(
    (val) => {
      try {
        const parsed = new URL(val)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    },
    { message: 'URL harus menggunakan protokol http atau https' }
  )

const baseServerSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_URL: httpUrlSchema.optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: httpUrlSchema.optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  DEV_ALLOWED_ORIGINS: z.string().optional(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: httpUrlSchema.default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: httpUrlSchema.optional(),
  NEXT_PUBLIC_USE_MOCK: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val !== 'false'),
  NEXT_PUBLIC_AUTH_RELAXED: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
})

const mergedSchema = baseServerSchema.merge(clientSchema).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production' && data.AUTH_SECRET && data.AUTH_SECRET.length < 32) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['AUTH_SECRET'],
      message: 'AUTH_SECRET harus memiliki panjang minimal 32 karakter pada mode production',
    })
  }
})

export type ServerEnv = z.infer<typeof baseServerSchema>
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
    NEXT_PUBLIC_AUTH_RELAXED: process.env.NEXT_PUBLIC_AUTH_RELAXED,
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
