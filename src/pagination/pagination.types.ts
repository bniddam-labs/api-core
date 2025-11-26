import { z } from 'zod';

/**
 * Zod schema for pagination parameters
 */
export const paginationParamsSchema = z.object({
  /** Page number (1-indexed) */
  page: z.number().int().positive(),
  /** Items per page */
  limit: z.number().int().positive(),
});

/**
 * Pagination parameters for queries
 */
export type PaginationParams = z.infer<typeof paginationParamsSchema>;

/**
 * Zod schema for offset pagination
 */
export const offsetPaginationSchema = z.object({
  /** Number of items to skip */
  offset: z.number().int().nonnegative(),
  /** Number of items to take */
  limit: z.number().int().positive(),
});

/**
 * Calculated offset and limit for database queries
 */
export type OffsetPagination = z.infer<typeof offsetPaginationSchema>;

/**
 * Zod schema for pagination metadata
 */
export const paginationMetaSchema = z.object({
  /** Current page number */
  page: z.number().int().positive(),
  /** Items per page */
  limit: z.number().int().positive(),
  /** Total number of items */
  total: z.number().int().nonnegative(),
  /** Total number of pages */
  totalPages: z.number().int().nonnegative(),
  /** Whether there is a next page */
  hasNextPage: z.boolean(),
  /** Whether there is a previous page */
  hasPreviousPage: z.boolean(),
});

/**
 * Pagination metadata for responses
 */
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * Create a Zod schema for paginated results
 */
export const createPaginatedResultSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    /** Array of data items */
    data: z.array(dataSchema),
    /** Pagination metadata */
    meta: paginationMetaSchema,
  });

/**
 * Paginated response structure
 */
export interface PaginatedResult<T> {
  /** Array of data items */
  data: T[];
  /** Pagination metadata */
  meta: PaginationMeta;
}
