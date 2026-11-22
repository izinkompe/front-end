import { z } from 'zod'

export const ApiResponseMetaSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  total: z.number().int().nonnegative().optional(),
  totalPages: z.number().int().nonnegative().optional(),
})

export type ApiResponseMeta = z.infer<typeof ApiResponseMetaSchema>

export interface ApiSuccessResponse<T> {
  data: T
  meta?: ApiResponseMeta
  message?: string
}

export interface ApiPaginatedResponse<T> {
  items: T[]
  meta: ApiResponseMeta
}
