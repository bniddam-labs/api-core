/**
 * @bniddam-labs/api-core
 *
 * Framework-agnostic HTTP API patterns with NestJS adapters
 *
 * This package provides:
 * - Core: Zod schemas, types, and helpers (framework-agnostic)
 * - NestJS: Decorators, pipes, filters, interceptors, Swagger helpers
 *
 * ## Usage
 *
 * ### Framework-agnostic (works with any HTTP framework)
 * ```typescript
 * import {
 *   // Schemas
 *   uuidSchema,
 *   slugSchema,
 *   errorResponseSchema,
 *   paginationQueryCoerceSchema,
 *   createPaginatedResultSchema,
 *   // Types
 *   type ErrorResponse,
 *   type PaginationMeta,
 *   type PaginatedResult,
 *   // Helpers
 *   slugify,
 *   calculatePaginationMeta,
 *   toOffsetPagination
 * } from '@bniddam-labs/api-core/core';
 * ```
 *
 * ### NestJS-specific
 * ```typescript
 * import {
 *   // Swagger decorators
 *   ApiSuccessResponse,
 *   ApiErrorResponse,
 *   ApiPaginatedResponse,
 *   ApiCommonResponses,
 *   // Filters
 *   AllExceptionsFilter,
 *   HttpExceptionFilter,
 *   // Interceptors
 *   LoggingInterceptor,
 *   // Pipes
 *   ZodValidationPipe,
 *   // Decorators
 *   ZodBody,
 *   ZodQuery,
 *   ZodParam
 * } from '@bniddam-labs/api-core/nestjs';
 * ```
 *
 * ### Import all
 * ```typescript
 * import * as apiCore from '@bniddam-labs/api-core';
 * // or
 * import * as core from '@bniddam-labs/api-core/core';
 * import * as nestjs from '@bniddam-labs/api-core/nestjs';
 * ```
 */

// Re-export everything for convenience
export * from './core';
export * from './nestjs';
