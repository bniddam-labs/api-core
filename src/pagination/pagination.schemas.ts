import { z } from 'zod';
import { paginationParamsSchema } from './pagination.types';

/**
 * Extended pagination schema with query params (search, sort)
 * This is useful for API endpoints that accept pagination + search/sort
 */
export const paginationQuerySchema = paginationParamsSchema.extend({
  search: z.string().trim().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Pagination schema with coercion for query string parsing
 * Use this when parsing query params from URLs
 */
export const paginationQueryCoerceSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

export type PaginationQueryCoerce = z.infer<typeof paginationQueryCoerceSchema>;
