import { z } from 'zod';

/**
 * Zod schema for API response metadata
 */
export const apiResponseMetaSchema = z.record(z.string(), z.unknown());

/**
 * Create a Zod schema for API response with typed data
 *
 * @template T - Zod schema for the data
 *
 * @example
 * ```typescript
 * const userResponseSchema = createApiResponseSchema(userSchema);
 * type UserResponse = z.infer<typeof userResponseSchema>;
 * ```
 */
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: apiResponseMetaSchema.optional(),
  });

/**
 * Generic API response type derived from schema
 *
 * @template T - The type of data being returned
 *
 * @example
 * ```typescript
 * import type { ApiResponse } from '@saas/api-core';
 *
 * const response: ApiResponse<User> = {
 *   data: user,
 *   meta: { requestId: '123' },
 * };
 * ```
 */
export type ApiResponse<T> = {
  data: T;
  meta?: z.infer<typeof apiResponseMetaSchema>;
};

/**
 * Zod schema for error response
 */
export const errorResponseSchema = z.object({
  /** HTTP status code */
  statusCode: z.number().int().min(100).max(599),
  /** Error message(s) */
  message: z.union([z.string(), z.array(z.string())]),
  /** Error type */
  error: z.string(),
  /** Timestamp when the error occurred */
  timestamp: z.string().optional(),
  /** Request path that caused the error */
  path: z.string().optional(),
  /** HTTP method used */
  method: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
