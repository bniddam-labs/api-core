import { Body } from '@nestjs/common';
import { ZodType } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe.js';

/**
 * Custom decorator that combines @Body and Zod validation
 *
 * This decorator simplifies the usage of Zod validation in controllers by
 * combining body extraction and validation into a single decorator.
 *
 * In development mode, detailed validation errors will be logged to the console
 * with the schema name (if provided), validation issues, and raw data.
 *
 * @param schema - The Zod schema to validate against
 * @param schemaName - Optional name of the schema for better error logging (e.g., 'loginSchema', 'createUserSchema')
 * @returns ParameterDecorator
 *
 * @example
 * ```typescript
 * import { ZodBody } from '@bniddam-labs/api-core/nestjs';
 * import { z } from 'zod';
 *
 * // Define your schema
 * const createUserSchema = z.object({
 *   email: z.email(),
 *   name: z.string().min(1),
 *   age: z.number().int().min(18).optional(),
 * });
 *
 * type CreateUserDto = z.infer<typeof createUserSchema>;
 *
 * // Basic usage
 * @Post('users')
 * async create(@ZodBody(createUserSchema) dto: CreateUserDto) {
 *   return this.usersService.create(dto);
 * }
 *
 * // With schema name for better logging in development
 * @Post('users')
 * async create(@ZodBody(createUserSchema, 'createUserSchema') dto: CreateUserDto) {
 *   return this.usersService.create(dto);
 * }
 * ```
 */
export function ZodBody(schema: ZodType, schemaName?: string): ParameterDecorator {
	return Body(new ZodValidationPipe(schema, schemaName));
}
