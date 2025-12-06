import { z } from 'zod';

/**
 * Zod schemas for API responses (success and error)
 */

// ============================================================================
// Success Response Schemas
// ============================================================================

/**
 * Metadata for API responses
 * Can contain any additional information about the response
 */
export const apiResponseMetaSchema = z.record(z.string(), z.unknown());

/**
 * Type inference for API response metadata
 */
export type ApiResponseMeta = z.infer<typeof apiResponseMetaSchema>;

/**
 * Create a typed API response schema
 *
 * @template T - Zod schema for the data
 *
 * @example
 * ```typescript
 * const userResponseSchema = createApiResponseSchema(userSchema);
 * type UserResponse = z.infer<typeof userResponseSchema>;
 * // { data: User, meta?: Record<string, unknown> }
 * ```
 */
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		data: dataSchema,
		meta: apiResponseMetaSchema.optional(),
	});

// ============================================================================
// Error Response Schema
// ============================================================================

/**
 * Standard error response schema
 * Used across all API endpoints for consistent error handling
 *
 * @example
 * ```typescript
 * {
 *   statusCode: 400,
 *   message: "Validation failed",
 *   error: "Bad Request",
 *   timestamp: "2025-01-26T10:30:00.000Z",
 *   path: "/api/users",
 *   method: "POST"
 * }
 * ```
 */
export const errorResponseSchema = z.object({
	/** HTTP status code */
	statusCode: z.number().int().min(100).max(599),
	/** Error message (string or array of strings for validation errors) */
	message: z.union([z.string(), z.array(z.string())]),
	/** Error type/name */
	error: z.string(),
	/** ISO timestamp when the error occurred */
	timestamp: z.string().optional(),
	/** Request path that caused the error */
	path: z.string().optional(),
	/** HTTP method used */
	method: z.string().optional(),
});

/**
 * Type inference for error response
 */
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
