import { Param } from '@nestjs/common';
import type { ZodType } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe.js';

/**
 * Custom decorator that combines @Param and Zod validation.
 *
 * Useful for validating route parameters (e.g., UUIDs, slugs) against Zod schemas.
 * In development mode, detailed validation errors will be logged to the console.
 *
 * @param schema - Zod schema used to validate route parameters.
 * @param schemaName - Optional name of the schema for better error logging (e.g., 'idParamSchema', 'slugParamSchema')
 *
 * @example
 * ```typescript
 * import { ZodParam } from '@bniddam-labs/api-core/nestjs';
 * import { idParamSchema, slugParamSchema, type IdParam, type SlugParam } from '@bniddam-labs/api-core/core';
 *
 * // Validate UUID param
 * @Get(':id')
 * async findOne(@ZodParam(idParamSchema) params: IdParam) {
 *   return this.usersService.findOne(params.id);
 * }
 *
 * // Validate slug param
 * @Get('posts/:slug')
 * async findBySlug(@ZodParam(slugParamSchema) params: SlugParam) {
 *   return this.postsService.findBySlug(params.slug);
 * }
 *
 * // With schema name for better logging
 * @Delete(':id')
 * async remove(@ZodParam(idParamSchema, 'idParamSchema') params: IdParam) {
 *   return this.usersService.remove(params.id);
 * }
 * ```
 */
export function ZodParam(schema: ZodType, schemaName?: string): ParameterDecorator {
	return Param(new ZodValidationPipe(schema, schemaName));
}
