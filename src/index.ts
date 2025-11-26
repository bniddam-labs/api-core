/**
 * @saas/api-core
 *
 * Generic HTTP API patterns for NestJS applications
 *
 * This package provides:
 * - Generic DTOs for pagination, search, and common parameters
 * - Zod validation decorators and pipes
 * - Swagger/OpenAPI configuration and helper decorators
 * - Standard HTTP response types
 *
 * @example
 * ```typescript
 * // Import validation decorators
 * import { ZodBody, ZodQuery, ZodParam } from '@saas/api-core/validation';
 *
 * // Import Swagger helpers
 * import { setupSwagger, ApiPaginatedResponse } from '@saas/api-core/swagger';
 *
 * // Import HTTP types
 * import type { ApiResponse } from '@saas/api-core/http';
 * ```
 */

export * from './http';
export * from './id';
export * from './pagination';
export * from './swagger';
export * from './validation';
