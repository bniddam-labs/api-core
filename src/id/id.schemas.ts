import { z } from 'zod';

/**
 * Zod schema for UUID validation (any version)
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Zod schema for UUID v4 validation
 */
export const uuidV4Schema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    'Invalid UUID v4 format',
  );

/**
 * Zod schema for slug validation
 */
export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'Invalid slug format (must be lowercase alphanumeric with hyphens)',
  );

/**
 * Create a Zod schema for an array of UUIDs
 */
export const uuidArraySchema = z.array(uuidSchema);

/**
 * Zod schema for optional UUID (nullable/undefined)
 */
export const optionalUuidSchema = uuidSchema.optional().nullable();
