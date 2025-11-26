import { applyDecorators, type Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Options for API response decorator
 */
interface ApiResponseDecoratorOptions {
  /**
   * HTTP status code
   */
  status: number;

  /**
   * Response description
   */
  description: string;

  /**
   * Response type/DTO class
   */
  type?: Type<unknown>;

  /**
   * Whether the response is an array
   * @default false
   */
  isArray?: boolean;
}

/**
 * Decorator for documenting successful API responses in Swagger
 *
 * @param options - Response configuration options
 *
 * @example
 * ```typescript
 * import { ApiSuccessResponse } from '@saas/api-core';
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
 * Error response schema matching errorResponseSchema from api-response.type.ts
 * Defined inline to avoid zod-to-json-schema type compatibility issues
 */
const errorResponseJsonSchema = {
  type: 'object',
  required: ['statusCode', 'message', 'error'],
  properties: {
    statusCode: { type: 'number', description: 'HTTP status code' },
    message: {
      oneOf: [
        { type: 'string', description: 'Error message' },
        { type: 'array', items: { type: 'string' }, description: 'Array of error messages' },
      ],
    },
    error: { type: 'string', description: 'Error name/type' },
    timestamp: { type: 'string', format: 'date-time', description: 'ISO 8601 timestamp' },
    path: { type: 'string', description: 'Request path' },
    method: { type: 'string', description: 'HTTP method' },
  },
};

/**
 * Pagination meta schema matching paginationMetaSchema from pagination.types.ts
 * Defined inline to avoid zod-to-json-schema type compatibility issues
 */
const paginationMetaJsonSchema = {
  type: 'object',
  required: ['page', 'limit', 'total', 'totalPages', 'hasNextPage', 'hasPreviousPage'],
  properties: {
    page: { type: 'number', minimum: 1, description: 'Current page number' },
    limit: { type: 'number', minimum: 1, maximum: 100, description: 'Items per page' },
    total: { type: 'number', minimum: 0, description: 'Total number of items' },
    totalPages: { type: 'number', minimum: 0, description: 'Total number of pages' },
    hasNextPage: { type: 'boolean', description: 'Whether there is a next page' },
    hasPreviousPage: { type: 'boolean', description: 'Whether there is a previous page' },
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
 * import { ApiErrorResponse } from '@saas/api-core';
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
 * import { ApiCommonResponses } from '@saas/api-core';
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
 * Shows both the data array and pagination metadata
 * Uses paginationMetaSchema Zod schema for consistent format
 *
 * @param dataType - The DTO class for individual items
 * @param description - Response description
 *
 * @example
 * ```typescript
 * import { ApiPaginatedResponse } from '@saas/api-core';
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
        meta: paginationMetaJsonSchema,
      },
    },
  });
}
