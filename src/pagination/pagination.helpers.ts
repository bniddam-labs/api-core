import type {
  OffsetPagination,
  PaginatedResult,
  PaginationMeta,
  PaginationParams,
} from './pagination.types';

/**
 * Convert page-based pagination to offset-based pagination
 *
 * @param params - Page and limit
 * @returns Offset and limit for database queries
 *
 * @example
 * ```ts
 * const { offset, limit } = toOffsetPagination({ page: 2, limit: 10 });
 * // offset: 10, limit: 10
 * ```
 */
export function toOffsetPagination(params: PaginationParams): OffsetPagination {
  const { page, limit } = params;
  return {
    offset: (page - 1) * limit,
    limit,
  };
}

/**
 * Calculate pagination metadata from total count
 *
 * @param params - Page and limit
 * @param total - Total number of items
 * @returns Complete pagination metadata
 *
 * @example
 * ```ts
 * const meta = calculatePaginationMeta({ page: 2, limit: 10 }, 45);
 * // { page: 2, limit: 10, total: 45, totalPages: 5, hasNextPage: true, hasPreviousPage: true }
 * ```
 */
export function calculatePaginationMeta(params: PaginationParams, total: number): PaginationMeta {
  const { page, limit } = params;
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Create a paginated result with data and metadata
 *
 * @param data - Array of items
 * @param params - Page and limit
 * @param total - Total number of items
 * @returns Paginated result with data and meta
 *
 * @example
 * ```ts
 * const result = createPaginatedResult(users, { page: 1, limit: 10 }, 25);
 * ```
 */
export function createPaginatedResult<T>(
  data: T[],
  params: PaginationParams,
  total: number,
): PaginatedResult<T> {
  return {
    data,
    meta: calculatePaginationMeta(params, total),
  };
}

/**
 * Normalize and validate pagination parameters
 *
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Normalized pagination parameters
 *
 * @example
 * ```ts
 * const params = normalizePagination(0, 200); // { page: 1, limit: 100 }
 * ```
 */
export function normalizePagination(
  page: number = 1,
  limit: number = 10,
  maxLimit: number = 100,
): PaginationParams {
  return {
    page: Math.max(1, Math.floor(page)),
    limit: Math.min(maxLimit, Math.max(1, Math.floor(limit))),
  };
}
