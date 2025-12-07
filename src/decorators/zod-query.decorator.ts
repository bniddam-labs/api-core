import { Query } from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe.js';

/**
 * Custom decorator that combines @Query and Zod validation.
 *
 * In development mode, detailed validation errors will be logged to the console
 * with the schema name (if provided), validation issues, and raw data.
 *
 * @param schema - Zod schema used to validate query parameters.
 * @param schemaName - Optional name of the schema for better error logging (e.g., 'paginationQueryCoerceSchema')
 *
 * @example
 * ```typescript
 * import { ZodQuery } from '@bniddam-labs/api-core/nestjs';
 * import { paginationQueryCoerceSchema, type PaginationQueryCoerce } from '@bniddam-labs/api-core/core';
 * import { z } from 'zod';
 *
 * // Paginated list with auto-coercion from query strings
 * @Get('users')
 * async findAll(@ZodQuery(paginationQueryCoerceSchema) query: PaginationQueryCoerce) {
 *   // query.page, query.limit automatically converted to numbers
 *   return this.usersService.findAll(query);
 * }
 *
 * // Custom search schema
 * const searchSchema = z.object({
 *   q: z.string().min(1),
 *   category: z.enum(['all', 'posts', 'users']).optional().default('all'),
 * });
 *
 * type SearchQuery = z.infer<typeof searchSchema>;
 *
 * @Get('search')
 * async search(@ZodQuery(searchSchema, 'searchSchema') query: SearchQuery) {
 *   return this.searchService.search(query);
 * }
 * ```
 */
export function ZodQuery(schema: ZodSchema, schemaName?: string): ParameterDecorator {
	return Query(new ZodValidationPipe(schema, schemaName));
}
