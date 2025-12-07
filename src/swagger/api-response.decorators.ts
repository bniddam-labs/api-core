import { applyDecorators, type Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { z } from 'zod';

/**
 * Zod schema for API response decorator options
 */
export const apiResponseDecoratorOptionsSchema = z.object({
	/** HTTP status code */
	status: z.number().int().min(100).max(599),
	/** Response description */
	description: z.string(),
	/** Response type/DTO class */
	type: z.custom<Type<unknown>>().optional(),
	/** Whether the response is an array */
	isArray: z.boolean().optional().default(false),
});

/**
 * Options for API response decorator
 */
export type ApiResponseDecoratorOptions = Omit<
	z.infer<typeof apiResponseDecoratorOptionsSchema>,
	'isArray'
> & {
	isArray?: boolean;
};

/**
 * Decorator for documenting successful API responses in Swagger
 *
 * @param options - Response configuration options
 *
 * @example
 * ```typescript
 * import { ApiSuccessResponse } from '@bniddam-labs/api-core/nestjs';
 *
 * @Get()
 * @ApiSuccessResponse({
 *   status: 200,
 *   description: 'Returns list of users',
 *   type: UserDto,
 *   isArray: true,
 * })
 * async findAll() {
 *   return this.usersService.findAll();
 * }
 * ```
 */
export function ApiSuccessResponse(options: ApiResponseDecoratorOptions) {
	const decorators = [
		ApiResponse({
			status: options.status,
			description: options.description,
			type: options.type,
			isArray: options.isArray,
		}),
	];

	return applyDecorators(...decorators);
}

/**
 * JSON Schema for error responses (matches errorResponseSchema from core/schemas)
 */
const errorResponseJsonSchema = {
	type: 'object',
	required: ['statusCode', 'message', 'error'],
	properties: {
		statusCode: { type: 'integer', minimum: 100, maximum: 599 },
		message: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
		error: { type: 'string' },
		timestamp: { type: 'string' },
		path: { type: 'string' },
		method: { type: 'string' },
	},
};

/**
 * Decorator for documenting error responses in Swagger
 * Uses the errorResponseSchema Zod schema for consistent error format
 *
 * @param status - HTTP status code
 * @param description - Error description
 *
 * @example
 * ```typescript
 * import { ApiErrorResponse } from '@bniddam-labs/api-core/nestjs';
 *
 * @Post()
 * @ApiErrorResponse(400, 'Invalid request data')
 * @ApiErrorResponse(401, 'Unauthorized')
 * async create(@Body() dto: CreateUserDto) {
 *   return this.usersService.create(dto);
 * }
 * ```
 */
export function ApiErrorResponse(status: number, description: string) {
	return ApiResponse({
		status,
		description,
		schema: {
			...errorResponseJsonSchema,
			example: {
				statusCode: status,
				message: description,
				error: getErrorName(status),
				timestamp: new Date().toISOString(),
				path: '/api/resource',
				method: 'GET',
			},
		},
	});
}

/**
 * Get standard HTTP error name from status code
 */
function getErrorName(status: number): string {
	const errorNames: Record<number, string> = {
		400: 'Bad Request',
		401: 'Unauthorized',
		403: 'Forbidden',
		404: 'Not Found',
		409: 'Conflict',
		422: 'Unprocessable Entity',
		429: 'Too Many Requests',
		500: 'Internal Server Error',
		502: 'Bad Gateway',
		503: 'Service Unavailable',
	};
	return errorNames[status] || 'Error';
}

/**
 * Decorator that adds common error responses to an endpoint
 * Includes: 400, 401, 403, 404, 429, 500
 *
 * @example
 * ```typescript
 * import { ApiCommonResponses } from '@bniddam-labs/api-core/nestjs';
 *
 * @Get(':id')
 * @ApiCommonResponses()
 * async findOne(@Param('id') id: string) {
 *   return this.usersService.findOne(id);
 * }
 * ```
 */
export function ApiCommonResponses() {
	return applyDecorators(
		ApiErrorResponse(400, 'Bad Request - Validation failed'),
		ApiErrorResponse(401, 'Unauthorized - Authentication required'),
		ApiErrorResponse(403, 'Forbidden - Insufficient permissions'),
		ApiErrorResponse(404, 'Not Found - Resource not found'),
		ApiErrorResponse(429, 'Too Many Requests - Rate limit exceeded'),
		ApiErrorResponse(500, 'Internal Server Error'),
	);
}

/**
 * Decorator for documenting paginated responses in Swagger
 * Shows both the data array and pagination metadata (matches paginationMetaSchema)
 *
 * @param dataType - The DTO class for individual items
 * @param description - Response description
 *
 * @example
 * ```typescript
 * import { ApiPaginatedResponse } from '@bniddam-labs/api-core/nestjs';
 *
 * @Get()
 * @ApiPaginatedResponse(UserDto, 'Returns paginated list of users')
 * async findAll(@Query() paginationDto: PaginationDto) {
 *   return this.usersService.findAll(paginationDto);
 * }
 * ```
 */
export function ApiPaginatedResponse(dataType: Type<unknown>, description: string) {
	return ApiResponse({
		status: 200,
		description,
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'array',
					items: { $ref: `#/components/schemas/${dataType.name}` },
				},
				meta: {
					type: 'object',
					properties: {
						page: { type: 'number', example: 1 },
						limit: { type: 'number', example: 10 },
						total: { type: 'number', example: 100 },
						totalPages: { type: 'number', example: 10 },
						hasNextPage: { type: 'boolean', example: true },
						hasPreviousPage: { type: 'boolean', example: false },
					},
				},
			},
		},
	});
}
