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
 * // Import DTOs
 * import { PaginatedResponseDto, PaginationQueryDto } from '@saas/api-core/dto';
 *
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

export * from './dto';
export * from './validation';
export * from './swagger';
export * from './http';
