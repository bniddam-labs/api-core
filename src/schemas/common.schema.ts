import { z } from 'zod';

/**
 * Common reusable Zod schemas for IDs, UUIDs, and slugs
 */

// ============================================================================
// UUID Schemas
// ============================================================================

/**
 * UUID validation (any version)
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * UUID v4 validation (strict)
 */
export const uuidV4Schema = z
	.string()
	.regex(
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
		'Invalid UUID v4 format',
	);

/**
 * Optional UUID (nullable or undefined)
 */
export const optionalUuidSchema = uuidSchema.optional().nullable();

/**
 * Array of UUIDs
 */
export const uuidArraySchema = z.array(uuidSchema);

// ============================================================================
// Slug Schemas
// ============================================================================

/**
 * Slug validation (lowercase alphanumeric with hyphens)
 *
 * @example "my-awesome-post", "user-profile-123"
 */
export const slugSchema = z
	.string()
	.regex(
		/^[a-z0-9]+(-[a-z0-9]+)*$/,
		'Invalid slug format (must be lowercase alphanumeric with hyphens)',
	);

/**
 * Optional slug (nullable or undefined)
 */
export const optionalSlugSchema = slugSchema.optional().nullable();

// ============================================================================
// Route Parameter Schemas
// ============================================================================

/**
 * Standard ID parameter schema for route params
 *
 * @example
 * ```typescript
 * const params = idParamSchema.parse({ id: '123e4567-e89b-12d3-a456-426614174000' });
 * ```
 */
export const idParamSchema = z.object({
	id: uuidSchema,
});

/**
 * Type inference for ID parameter
 */
export type IdParam = z.infer<typeof idParamSchema>;

/**
 * Standard slug parameter schema for route params
 *
 * @example
 * ```typescript
 * const params = slugParamSchema.parse({ slug: 'my-awesome-post' });
 * ```
 */
export const slugParamSchema = z.object({
	slug: slugSchema,
});

/**
 * Type inference for slug parameter
 */
export type SlugParam = z.infer<typeof slugParamSchema>;
