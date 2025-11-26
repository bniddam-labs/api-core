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
 * Decorator for documenting error responses in Swagger
 * Automatically formats error response schema with standard error fields
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
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: status,
        },
        message: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
        },
        error: {
          type: 'string',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
        },
        path: {
          type: 'string',
        },
        method: {
          type: 'string',
        },
      },
    },
  });
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
