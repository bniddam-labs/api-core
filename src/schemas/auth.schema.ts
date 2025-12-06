import { z } from 'zod';
import { uuidSchema } from './common.schema';

/**
 * Zod schemas for authentication and authorization
 */

// ============================================================================
// Authenticated User Schema
// ============================================================================

/**
 * Schema for authenticated user in request context
 * Typically attached to requests after authentication middleware
 *
 * @example
 * ```typescript
 * // In NestJS guard or middleware
 * const user = authenticatedUserSchema.parse(request.user);
 * ```
 */
export const authenticatedUserSchema = z.object({
	/** User unique identifier (UUID) */
	id: uuidSchema,
	/** User email address */
	email: z.string().email().optional(),
});

/**
 * Type inference for authenticated user
 */
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
