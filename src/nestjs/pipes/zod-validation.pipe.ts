import { type ArgumentMetadata, BadRequestException, Injectable, Logger, type PipeTransform } from '@nestjs/common';
import type { ZodError, ZodSchema } from 'zod';
import { fromError } from 'zod-validation-error';

/**
 * Zod validation pipe for NestJS
 *
 * Validates request data against Zod schemas and returns user-friendly error messages.
 * In development mode, logs detailed validation errors to the console for easier debugging.
 *
 * @example
 * // Direct usage in controller
 * ```typescript
 * import { z } from 'zod';
 *
 * const loginSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * type LoginDto = z.infer<typeof loginSchema>;
 *
 * @Post('login')
 * @UsePipes(new ZodValidationPipe(loginSchema, 'loginSchema'))
 * async login(@Body() dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 * ```
 *
 * @example
 * // Usage with custom decorator (recommended)
 * ```typescript
 * import { ZodBody } from '@bniddam-labs/api-core/nestjs';
 * import { z } from 'zod';
 *
 * const loginSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * type LoginDto = z.infer<typeof loginSchema>;
 *
 * @Post('login')
 * async login(@ZodBody(loginSchema) dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 * ```
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
	private readonly logger = new Logger(ZodValidationPipe.name);

	/**
	 * @param schema - Zod schema to validate against
	 * @param schemaName - Optional name of the schema for better logging (e.g., 'loginSchema', 'registerUserSchema')
	 */
	constructor(private schema: ZodSchema, private schemaName?: string) {}

	transform(value: unknown, _metadata: ArgumentMetadata) {
		try {
			// Parse and validate the value against the schema
			const parsedValue = this.schema.parse(value);
			return parsedValue;
		} catch (error) {
			// Log detailed validation errors in development mode
			const isDevelopment = process.env.NODE_ENV === 'development';
			if (isDevelopment && this.isZodError(error)) {
				this.logZodValidationError(error, value);
			}

			// Convert Zod errors to detailed, user-friendly messages
			const validationError = fromError(error);

			// Extract detailed errors from Zod
			let detailedErrors: Array<{ path: string; message: string }> = [];
			if (error && typeof error === 'object' && 'issues' in error) {
				detailedErrors = (error as ZodError).issues.map((issue) => ({
					path: issue.path.join('.'),
					message: issue.message,
				}));
			}

			throw new BadRequestException({
				message: 'Validation failed',
				error: validationError.toString(),
				errors: detailedErrors,
				statusCode: 400,
			});
		}
	}

	/**
	 * Type guard to check if error is a ZodError
	 */
	private isZodError(error: unknown): error is ZodError {
		return error !== null && typeof error === 'object' && 'issues' in error && Array.isArray((error as ZodError).issues);
	}

	/**
	 * Log detailed Zod validation errors in development mode
	 * This provides comprehensive error information without affecting the HTTP response
	 */
	private logZodValidationError(error: ZodError, rawData: unknown): void {
		const schemaInfo = this.schemaName ? `Schema: ${this.schemaName}` : 'Schema: <unnamed>';
		const separator = '─'.repeat(80);

		// Build detailed error log
		const errorLines = ['', separator, '❌ [ZOD VALIDATION ERROR]', schemaInfo, '', 'Issues:'];

		// Add each validation issue with detailed information
		for (const issue of error.issues) {
			const path = issue.path.length > 0 ? issue.path.join('.') : '<root>';
			const received = 'received' in issue ? ` (received: ${JSON.stringify(issue.received)})` : '';
			const expected = 'expected' in issue ? ` (expected: ${issue.expected})` : '';

			errorLines.push(`  • ${path}: ${issue.message}${expected}${received}`);

			// Add additional context if available
			if (issue.code === 'invalid_type') {
				errorLines.push(`    └─ Type mismatch detected`);
			} else if (issue.code === 'invalid_string' && 'validation' in issue) {
				errorLines.push(`    └─ Validation type: ${issue.validation}`);
			} else if (issue.code === 'too_small' || issue.code === 'too_big') {
				errorLines.push(`    └─ Constraint violation`);
			}
		}

		// Add raw data for debugging (with size limit to avoid console spam)
		errorLines.push('');
		errorLines.push('Raw data received:');

		const rawDataString = JSON.stringify(rawData, null, 2);
		if (rawDataString.length > 1000) {
			// Truncate large payloads
			errorLines.push(`${rawDataString.substring(0, 1000)}... [truncated, total size: ${rawDataString.length} chars]`);
		} else {
			errorLines.push(rawDataString);
		}

		errorLines.push(separator);
		errorLines.push('');

		// Log as a single error message
		this.logger.error(errorLines.join('\n'));
	}
}
