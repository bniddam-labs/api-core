/**
 * Core Zod schemas - framework-agnostic validation schemas
 *
 * @module @bniddam-labs/api-core/core/schemas
 */

// Common schemas (IDs, UUIDs, slugs)
export * from './common.schema';

// API response schemas (success and error)
export * from './response.schema';

// Pagination schemas
export * from './pagination.schema';

// Authentication schemas
export * from './auth.schema';
