import { Query } from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { ZodValidationPipe } from './zod.pipe';

/**
 * Custom decorator that combines @Query and Zod validation.
 *
 * In development mode, detailed validation errors will be logged to the console
 * with the schema name (if provided), validation issues, and raw data.
 *
 * @param schema - Zod schema used to validate query parameters.
 * @param schemaName - Optional name of the schema for better error logging (e.g., 'paginationSchema')
 *
 * @example
 * ```typescript
 * import { ZodQuery } from '@saas/api-core';
 * import { paginationSchema, type PaginationDto } from '@saas/schemas';
 *
 * // Basic usage
 * @Get('users')
 * async getUsers(@ZodQuery(paginationSchema) query: PaginationDto) {
 *   return this.usersService.findAll(query);
 * }
 *
 * // With schema name for better logging in development
 * @Get('search')
 * async search(@ZodQuery(searchSchema, 'searchSchema') query: SearchDto) {
 *   return this.searchService.search(query);
 * }
 * ```
 */
export function ZodQuery(schema: ZodSchema, schemaName?: string): ParameterDecorator {
  return Query(new ZodValidationPipe(schema, schemaName));
}
