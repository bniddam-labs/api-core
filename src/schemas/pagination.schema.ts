import { z } from 'zod';

/**
 * Zod schemas for pagination
 */

// ============================================================================
// Basic Pagination Schemas
// ============================================================================

/**
 * Page-based pagination parameters
 *
 * @example
 * ```typescript
 * const params = paginationParamsSchema.parse({ page: 1, limit: 10 });
 * ```
 */
export const paginationParamsSchema = z.object({
	/** Page number (1-indexed) */
	page: z.number().int().positive(),
	/** Items per page */
	limit: z.number().int().positive(),
});

/**
 * Type inference for pagination parameters
 */
export type PaginationParams = z.infer<typeof paginationParamsSchema>;

/**
 * Offset-based pagination (alternative to page-based)
 *
 * @example
 * ```typescript
 * const params = offsetPaginationSchema.parse({ offset: 0, limit: 10 });
 * ```
 */
export const offsetPaginationSchema = z.object({
	/** Number of items to skip */
	offset: z.number().int().nonnegative(),
	/** Number of items to take */
	limit: z.number().int().positive(),
});

/**
 * Type inference for offset pagination
 */
export type OffsetPagination = z.infer<typeof offsetPaginationSchema>;

// ============================================================================
// Pagination Metadata Schema
// ============================================================================

/**
 * Pagination metadata returned in API responses
 *
 * @example
 * ```typescript
 * {
 *   page: 1,
 *   limit: 10,
 *   total: 100,
 *   totalPages: 10,
 *   hasNextPage: true,
 *   hasPreviousPage: false
 * }
 * ```
 */
export const paginationMetaSchema = z.object({
	/** Current page number */
	page: z.number().int().positive(),
	/** Items per page */
	limit: z.number().int().positive(),
	/** Total number of items across all pages */
	total: z.number().int().nonnegative(),
	/** Total number of pages */
	totalPages: z.number().int().nonnegative(),
	/** Whether there is a next page */
	hasNextPage: z.boolean(),
	/** Whether there is a previous page */
	hasPreviousPage: z.boolean(),
});

/**
 * Type inference for pagination metadata
 */
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

// ============================================================================
// Paginated Result Schema
// ============================================================================

/**
 * Create a schema for paginated API response
 *
 * @template T - Zod schema for individual items
 *
 * @example
 * ```typescript
 * const paginatedUsersSchema = createPaginatedResultSchema(userSchema);
 * type PaginatedUsers = z.infer<typeof paginatedUsersSchema>;
 * // { data: User[], meta: PaginationMeta }
 * ```
 */
export const createPaginatedResultSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		/** Array of data items */
		data: z.array(dataSchema),
		/** Pagination metadata */
		meta: paginationMetaSchema,
	});

// ============================================================================
// Query Parameter Schemas
// ============================================================================

/**
 * Maximum items per page (used across all pagination schemas)
 */
export const MAX_ITEMS_PER_PAGE = 100;

/**
 * Extended pagination with search and sort capabilities
 * Use this for complex list endpoints
 *
 * @example
 * ```typescript
 * const query = paginationQuerySchema.parse({
 *   page: 1,
 *   limit: 10,
 *   search: 'john',
 *   sortBy: 'createdAt',
 *   sortOrder: 'DESC'
 * });
 * ```
 */
export const paginationQuerySchema = paginationParamsSchema
	.extend({
		/** Items per page (max 100) */
		limit: z.number().int().positive().max(MAX_ITEMS_PER_PAGE),
	})
	.extend({
		/** Search term to filter results */
		search: z.string().trim().optional(),
		/** Field to sort by */
		sortBy: z.string().optional(),
		/** Sort direction */
		sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
	});

/**
 * Type inference for pagination query
 */
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Pagination query with automatic coercion from query strings
 * Use this when parsing URL query parameters
 *
 * @example
 * ```typescript
 * // GET /api/users?page=1&limit=10&search=john
 * const query = paginationQueryCoerceSchema.parse(req.query);
 * ```
 */
export const paginationQueryCoerceSchema = z.object({
	/** Page number (coerced from string, defaults to 1) */
	page: z.coerce.number().int().positive().default(1),
	/** Items per page (coerced from string, max 100, defaults to 10) */
	limit: z.coerce.number().int().positive().max(MAX_ITEMS_PER_PAGE).default(10),
	/** Search term */
	search: z.string().trim().optional(),
	/** Field to sort by */
	sortBy: z.string().optional(),
	/** Sort direction */
	sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

/**
 * Type inference for coerced pagination query
 */
export type PaginationQueryCoerce = z.infer<typeof paginationQueryCoerceSchema>;
