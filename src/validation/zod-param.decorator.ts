import { Param } from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { ZodValidationPipe } from './zod.pipe';

/**
 * Custom decorator that combines @Param and Zod validation.
 *
 * Useful for validating route parameters (e.g., UUIDs, IDs) against Zod schemas.
 * In development mode, detailed validation errors will be logged to the console.
 *
 * @param schema - Zod schema used to validate route parameters.
 * @param schemaName - Optional name of the schema for better error logging (e.g., 'uuidParamSchema')
 *
 * @example
 * ```typescript
 * import { ZodParam } from '@saas/api-core';
 * import { uuidSchema } from '@saas/utils';
 * import { z } from 'zod';
 *
 * // Validate UUID param
 * const idParamSchema = z.object({ id: uuidSchema });
 *
 * @Get(':id')
 * async findOne(@ZodParam(idParamSchema) params: { id: string }) {
 *   return this.usersService.findOne(params.id);
 * }
 *
 * // With schema name for better logging
 * @Delete(':id')
 * async remove(@ZodParam(idParamSchema, 'idParamSchema') params: { id: string }) {
 *   return this.usersService.remove(params.id);
 * }
 * ```
 */
export function ZodParam(schema: ZodSchema, schemaName?: string): ParameterDecorator {
  return Param(new ZodValidationPipe(schema, schemaName));
}
