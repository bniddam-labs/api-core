/**
 * Core TypeScript types - framework-agnostic
 * All types are re-exported from Zod schemas for convenience
 */

import type { ApiResponseMeta as _ApiResponseMeta } from '../schemas/response.schema.js';
import type { PaginationMeta as _PaginationMeta } from '../schemas/pagination.schema.js';

// Re-export all types from schemas (types are now defined alongside schemas)
export type {
	// Common types
	IdParam,
	SlugParam,
} from '../schemas/common.schema.js';

export type {
	// Response types
	ApiResponseMeta,
	ErrorResponse,
} from '../schemas/response.schema.js';

export type {
	// Pagination types
	PaginationParams,
	OffsetPagination,
	PaginationMeta,
	PaginationQuery,
	PaginationQueryCoerce,
} from '../schemas/pagination.schema.js';

export type {
	// Auth types
	AuthenticatedUser,
} from '../schemas/auth.schema.js';

// Additional helper types

/**
 * Generic API response type
 */
export type ApiResponse<T> = {
	data: T;
	meta?: _ApiResponseMeta;
};

/**
 * Paginated response structure
 */
export interface PaginatedResult<T> {
	/** Array of data items */
	data: T[];
	/** Pagination metadata */
	meta: _PaginationMeta;
}
