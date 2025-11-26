import { Body } from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { ZodValidationPipe } from './zod.pipe';

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
 * @param schemaName - Optional name of the schema for better error logging (e.g., 'loginSchema', 'registerUserSchema')
 * @returns ParameterDecorator
 *
 * @example
 * ```typescript
 * import { ZodBody } from '@saas/api-core';
 * import { loginSchema, type LoginDto } from '@saas/schemas/auth';
 *
 * // Basic usage
 * @Post('login')
 * async login(@ZodBody(loginSchema) dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 *
 * // With schema name for better logging in development
 * @Post('register')
 * async register(@ZodBody(registerSchema, 'registerSchema') dto: RegisterDto) {
 *   return this.authService.register(dto);
 * }
 * ```
 */
export function ZodBody(schema: ZodSchema, schemaName?: string): ParameterDecorator {
  return Body(new ZodValidationPipe(schema, schemaName));
}
