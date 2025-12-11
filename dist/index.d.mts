import { z, ZodType, ZodIssue, ZodTypeAny } from 'zod';
import { ExceptionFilter, ArgumentsHost, HttpException, NestInterceptor, ExecutionContext, CallHandler, PipeTransform, ArgumentMetadata, Type, INestApplication } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

/**
 * Common reusable Zod schemas for IDs, UUIDs, and slugs
 */
/**
 * UUID validation (any version)
 */
declare const uuidSchema: z.ZodString;
/**
 * UUID v4 validation (strict)
 */
declare const uuidV4Schema: z.ZodString;
/**
 * Optional UUID (nullable or undefined)
 */
declare const optionalUuidSchema: z.ZodNullable<z.ZodOptional<z.ZodString>>;
/**
 * Array of UUIDs
 */
declare const uuidArraySchema: z.ZodArray<z.ZodString>;
/**
 * Slug validation (lowercase alphanumeric with hyphens)
 *
 * @example "my-awesome-post", "user-profile-123"
 */
declare const slugSchema: z.ZodString;
/**
 * Optional slug (nullable or undefined)
 */
declare const optionalSlugSchema: z.ZodNullable<z.ZodOptional<z.ZodString>>;
/**
 * Standard ID parameter schema for route params
 *
 * @example
 * ```typescript
 * const params = idParamSchema.parse({ id: '123e4567-e89b-12d3-a456-426614174000' });
 * ```
 */
declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Type inference for ID parameter
 */
type IdParam = z.infer<typeof idParamSchema>;
/**
 * Standard slug parameter schema for route params
 *
 * @example
 * ```typescript
 * const params = slugParamSchema.parse({ slug: 'my-awesome-post' });
 * ```
 */
declare const slugParamSchema: z.ZodObject<{
    slug: z.ZodString;
}, z.core.$strip>;
/**
 * Type inference for slug parameter
 */
type SlugParam = z.infer<typeof slugParamSchema>;

/**
 * Zod schemas for API responses (success and error)
 */
/**
 * Metadata for API responses
 * Can contain any additional information about the response
 */
declare const apiResponseMetaSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
/**
 * Type inference for API response metadata
 */
type ApiResponseMeta = z.infer<typeof apiResponseMetaSchema>;
/**
 * Create a typed API response schema
 *
 * @template T - Zod schema for the data
 *
 * @example
 * ```typescript
 * const userResponseSchema = createApiResponseSchema(userSchema);
 * type UserResponse = z.infer<typeof userResponseSchema>;
 * // { data: User, meta?: Record<string, unknown> }
 * ```
 */
declare const createApiResponseSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    data: T;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
/**
 * Standard error response schema
 * Used across all API endpoints for consistent error handling
 *
 * @example
 * ```typescript
 * {
 *   statusCode: 400,
 *   message: "Validation failed",
 *   error: "Bad Request",
 *   timestamp: "2025-01-26T10:30:00.000Z",
 *   path: "/api/users",
 *   method: "POST"
 * }
 * ```
 */
declare const errorResponseSchema: z.ZodObject<{
    statusCode: z.ZodNumber;
    message: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>;
    error: z.ZodString;
    timestamp: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
    method: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Type inference for error response
 */
type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Zod schemas for pagination
 */
/**
 * Page-based pagination parameters
 *
 * @example
 * ```typescript
 * const params = paginationParamsSchema.parse({ page: 1, limit: 10 });
 * ```
 */
declare const paginationParamsSchema: z.ZodObject<{
    page: z.ZodNumber;
    limit: z.ZodNumber;
}, z.core.$strip>;
/**
 * Type inference for pagination parameters
 */
type PaginationParams = z.infer<typeof paginationParamsSchema>;
/**
 * Offset-based pagination (alternative to page-based)
 *
 * @example
 * ```typescript
 * const params = offsetPaginationSchema.parse({ offset: 0, limit: 10 });
 * ```
 */
declare const offsetPaginationSchema: z.ZodObject<{
    offset: z.ZodNumber;
    limit: z.ZodNumber;
}, z.core.$strip>;
/**
 * Type inference for offset pagination
 */
type OffsetPagination = z.infer<typeof offsetPaginationSchema>;
/**
 * Pagination metadata returned in API responses
 *
 * @example
 * ```typescript
 * {
 *   page: 1,
 *   limit: 10,
 *   total: 100,
 *   totalPages: 10,
 *   hasNextPage: true,
 *   hasPreviousPage: false
 * }
 * ```
 */
declare const paginationMetaSchema: z.ZodObject<{
    page: z.ZodNumber;
    limit: z.ZodNumber;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
    hasNextPage: z.ZodBoolean;
    hasPreviousPage: z.ZodBoolean;
}, z.core.$strip>;
/**
 * Type inference for pagination metadata
 */
type PaginationMeta = z.infer<typeof paginationMetaSchema>;
/**
 * Create a schema for paginated API response
 *
 * @template T - Zod schema for individual items
 *
 * @example
 * ```typescript
 * const paginatedUsersSchema = createPaginatedResultSchema(userSchema);
 * type PaginatedUsers = z.infer<typeof paginatedUsersSchema>;
 * // { data: User[], meta: PaginationMeta }
 * ```
 */
declare const createPaginatedResultSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    data: z.ZodArray<T>;
    meta: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
        hasNextPage: z.ZodBoolean;
        hasPreviousPage: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Maximum items per page (used across all pagination schemas)
 */
declare const MAX_ITEMS_PER_PAGE = 100;
/**
 * Extended pagination with search and sort capabilities
 * Use this for complex list endpoints
 *
 * @example
 * ```typescript
 * const query = paginationQuerySchema.parse({
 *   page: 1,
 *   limit: 10,
 *   search: 'john',
 *   sortBy: 'createdAt',
 *   sortOrder: 'DESC'
 * });
 * ```
 */
declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodNumber;
    limit: z.ZodNumber;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ASC: "ASC";
        DESC: "DESC";
    }>>>;
}, z.core.$strip>;
/**
 * Type inference for pagination query
 */
type PaginationQuery = z.infer<typeof paginationQuerySchema>;
/**
 * Pagination query with automatic coercion from query strings
 * Use this when parsing URL query parameters
 *
 * @example
 * ```typescript
 * // GET /api/users?page=1&limit=10&search=john
 * const query = paginationQueryCoerceSchema.parse(req.query);
 * ```
 */
declare const paginationQueryCoerceSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ASC: "ASC";
        DESC: "DESC";
    }>>>;
}, z.core.$strip>;
/**
 * Type inference for coerced pagination query
 */
type PaginationQueryCoerce = z.infer<typeof paginationQueryCoerceSchema>;

/**
 * Zod schemas for authentication and authorization
 */
/**
 * Schema for authenticated user in request context
 * Typically attached to requests after authentication middleware
 *
 * @example
 * ```typescript
 * // In NestJS guard or middleware
 * const user = authenticatedUserSchema.parse(request.user);
 * ```
 */
declare const authenticatedUserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodOptional<z.ZodEmail>;
}, z.core.$strip>;
/**
 * Type inference for authenticated user
 */
type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

/**
 * Core TypeScript types - framework-agnostic
 * All types are re-exported from Zod schemas for convenience
 */

/**
 * Generic API response type
 */
type ApiResponse<T> = {
    data: T;
    meta?: ApiResponseMeta;
};
/**
 * Paginated response structure
 */
interface PaginatedResult<T> {
    /** Array of data items */
    data: T[];
    /** Pagination metadata */
    meta: PaginationMeta;
}

/**
 * Validate if a string is a valid UUID v4
 *
 * @param value - String to validate
 * @returns True if valid UUID v4
 *
 * @example
 * ```ts
 * isValidUuid('123e4567-e89b-12d3-a456-426614174000'); // true
 * isValidUuid('invalid'); // false
 * ```
 */
declare function isValidUuid(value: string): boolean;
/**
 * Validate if a string is specifically a UUID v4
 *
 * @param value - String to validate
 * @returns True if valid UUID v4
 */
declare function isValidUuidV4(value: string): boolean;
/**
 * Extract all UUIDs from a string
 *
 * @param text - Text containing UUIDs
 * @returns Array of found UUIDs
 *
 * @example
 * ```ts
 * extractUuids('User 123e4567-e89b-12d3-a456-426614174000 and file abc');
 * // ['123e4567-e89b-12d3-a456-426614174000']
 * ```
 */
declare function extractUuids(text: string): string[];

/**
 * Convert page-based pagination to offset-based pagination
 *
 * @param params - Page and limit
 * @returns Offset and limit for database queries
 *
 * @example
 * ```ts
 * const { offset, limit } = toOffsetPagination({ page: 2, limit: 10 });
 * // offset: 10, limit: 10
 * ```
 */
declare function toOffsetPagination(params: PaginationParams): OffsetPagination;
/**
 * Calculate pagination metadata from total count
 *
 * @param params - Page and limit
 * @param total - Total number of items
 * @returns Complete pagination metadata
 *
 * @example
 * ```ts
 * const meta = calculatePaginationMeta({ page: 2, limit: 10 }, 45);
 * // { page: 2, limit: 10, total: 45, totalPages: 5, hasNextPage: true, hasPreviousPage: true }
 * ```
 */
declare function calculatePaginationMeta(params: PaginationParams, total: number): PaginationMeta;
/**
 * Create a paginated result with data and metadata
 *
 * @param data - Array of items
 * @param params - Page and limit
 * @param total - Total number of items
 * @returns Paginated result with data and meta
 *
 * @example
 * ```ts
 * const result = createPaginatedResult(users, { page: 1, limit: 10 }, 25);
 * ```
 */
declare function createPaginatedResult<T>(data: T[], params: PaginationParams, total: number): PaginatedResult<T>;
/**
 * Normalize and validate pagination parameters
 *
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param maxLimit - Maximum allowed limit (default: MAX_ITEMS_PER_PAGE = 100)
 * @returns Normalized pagination parameters
 *
 * @example
 * ```ts
 * const params = normalizePagination(0, 200); // { page: 1, limit: 100 }
 * ```
 */
declare function normalizePagination(page?: number, limit?: number, maxLimit?: number): PaginationParams;

/**
 * Convert a string to a URL-friendly slug
 *
 * - Removes diacritics (accents)
 * - Converts to lowercase
 * - Replaces non-alphanumeric characters with hyphens
 * - Removes leading/trailing hyphens
 * - Collapses multiple hyphens
 *
 * @param value - String to slugify
 * @param fallback - Fallback string if result is empty (default: 'slug')
 * @returns URL-friendly slug
 *
 * @example
 * ```ts
 * slugify('Hello World!'); // 'hello-world'
 * slugify('Café & Restaurant'); // 'cafe-restaurant'
 * slugify('---'); // 'slug'
 * slugify('___', 'default'); // 'default'
 * ```
 */
declare function slugify(value: string, fallback?: string): string;
/**
 * Generate a unique slug by appending a number if necessary
 *
 * @param value - Base string to slugify
 * @param existingSlugs - Array of existing slugs to check against
 * @param fallback - Fallback string if result is empty
 * @returns Unique slug
 *
 * @example
 * ```ts
 * generateUniqueSlug('my-post', ['my-post', 'my-post-2']); // 'my-post-3'
 * ```
 */
declare function generateUniqueSlug(value: string, existingSlugs: string[], fallback?: string): string;
/**
 * Validate if a string is a valid slug format
 *
 * @param value - String to validate
 * @returns True if valid slug format
 *
 * @example
 * ```ts
 * isValidSlug('hello-world'); // true
 * isValidSlug('Hello World'); // false
 * isValidSlug('hello_world'); // false
 * ```
 */
declare function isValidSlug(value: string): boolean;

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
declare function ZodBody(schema: ZodType, schemaName?: string): ParameterDecorator;

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
declare function ZodParam(schema: ZodType, schemaName?: string): ParameterDecorator;

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
declare function ZodQuery(schema: ZodType, schemaName?: string): ParameterDecorator;

/**
 * Global exception filter that catches all uncaught exceptions
 * Provides consistent error response formatting and logging
 *
 * In production, sensitive error details are hidden from the response
 * In development, full error details are included for debugging
 */
declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
    /**
     * Get standard HTTP error name from status code
     */
    private getErrorName;
}

/**
 * Exception filter specifically for HttpException instances
 * Provides detailed error formatting and security-aware logging
 *
 * In production mode, sensitive error details are stripped from 500+ errors
 */
declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: HttpException, host: ArgumentsHost): void;
    /**
     * Get standard HTTP error name from status code
     */
    private getErrorName;
}

/**
 * Interface for authenticated requests with user information
 */
interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}
/**
 * HTTP request logging interceptor
 * Logs incoming requests and their completion with duration and status
 *
 * Logs include:
 * - Request method, URL, IP, user agent
 * - User ID if authenticated
 * - Response status code and duration
 * - Error details on failure
 */
declare class LoggingInterceptor implements NestInterceptor {
    private readonly logger;
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}

declare const isInvalidType: (issue: ZodIssue) => issue is Extract<ZodIssue, {
    code: "invalid_type";
}>;
declare const isInvalidFormat: (issue: ZodIssue) => issue is Extract<ZodIssue, {
    code: "invalid_format";
}>;
declare const isTooSmall: (issue: ZodIssue) => issue is Extract<ZodIssue, {
    code: "too_small";
}>;
declare const isTooBig: (issue: ZodIssue) => issue is Extract<ZodIssue, {
    code: "too_big";
}>;
declare const isNotMultipleOf: (issue: ZodIssue) => issue is Extract<ZodIssue, {
    code: "not_multiple_of";
}>;
declare const isUnrecognizedKeys: (issue: ZodIssue) => issue is Extract<ZodIssue, {
    code: "unrecognized_keys";
}>;
declare const isInvalidUnion: (issue: ZodIssue) => issue is Extract<ZodIssue, {
    code: "invalid_union";
}>;
declare const isInvalidKey: (issue: ZodIssue) => issue is Extract<ZodIssue, {
    code: "invalid_key";
}>;
declare const isInvalidElement: (issue: ZodIssue) => issue is Extract<ZodIssue, {
    code: "invalid_element";
}>;
declare const isInvalidValue: (issue: ZodIssue) => issue is Extract<ZodIssue, {
    code: "invalid_value";
}>;
declare const isCustomIssue: (issue: ZodIssue) => issue is Extract<ZodIssue, {
    code: "custom";
}>;
declare function readInput(issue: ZodIssue): string;
declare class ZodValidationPipe implements PipeTransform {
    private readonly schema;
    private readonly schemaName?;
    private readonly logger;
    constructor(schema: ZodTypeAny, schemaName?: string | undefined);
    transform(value: unknown, metadata: ArgumentMetadata): unknown;
    private logZodValidationError;
    private formatIssue;
}

/**
 * Zod schema for API response decorator options
 */
declare const apiResponseDecoratorOptionsSchema: z.ZodObject<{
    status: z.ZodNumber;
    description: z.ZodString;
    type: z.ZodOptional<z.ZodCustom<Type<unknown>, Type<unknown>>>;
    isArray: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
/**
 * Options for API response decorator
 */
type ApiResponseDecoratorOptions = Omit<z.infer<typeof apiResponseDecoratorOptionsSchema>, 'isArray'> & {
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
declare function ApiSuccessResponse(options: ApiResponseDecoratorOptions): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
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
declare function ApiErrorResponse(status: number, description: string): MethodDecorator & ClassDecorator;
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
declare function ApiCommonResponses(): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
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
declare function ApiPaginatedResponse(dataType: Type<unknown>, description: string): MethodDecorator & ClassDecorator;

/**
 * Decorator for documenting request body with Zod schema in Swagger
 * Automatically converts Zod schema to OpenAPI schema using z.toJSONSchema()
 *
 * Use this decorator along with @ZodBody for complete validation and documentation
 *
 * @param schema - The Zod schema for the request body
 * @param description - Optional description of the request body
 *
 * @example
 * ```typescript
 * import { ZodBody, ApiZodBody } from '@bniddam-labs/api-core/nestjs';
 * import { z } from 'zod';
 *
 * const createUserSchema = z.object({
 *   email: z.string().email().describe('User email address'),
 *   name: z.string().min(1).describe('User full name'),
 *   age: z.number().int().min(18).optional().describe('User age'),
 *   role: z.enum(['admin', 'user']).default('user'),
 * });
 *
 * type CreateUserDto = z.infer<typeof createUserSchema>;
 *
 * @Post('users')
 * @ApiZodBody(createUserSchema, 'User creation data')
 * async create(@ZodBody(createUserSchema) dto: CreateUserDto) {
 *   return this.usersService.create(dto);
 * }
 * ```
 */
declare function ApiZodBody(schema: ZodType, description?: string): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
/**
 * Decorator for documenting query parameters with Zod schema in Swagger
 * Automatically converts Zod object schema to individual query parameter definitions
 *
 * Use this decorator along with @ZodQuery for complete validation and documentation
 *
 * @param schema - The Zod object schema for query parameters
 *
 * @example
 * ```typescript
 * import { ZodQuery, ApiZodQuery } from '@bniddam-labs/api-core/nestjs';
 * import { z } from 'zod';
 *
 * const searchQuerySchema = z.object({
 *   q: z.string().min(1).describe('Search query'),
 *   category: z.enum(['all', 'posts', 'users']).optional().default('all'),
 *   page: z.coerce.number().int().min(1).default(1).describe('Page number'),
 *   limit: z.coerce.number().int().min(1).max(100).default(10).describe('Items per page'),
 * });
 *
 * type SearchQuery = z.infer<typeof searchQuerySchema>;
 *
 * @Get('search')
 * @ApiZodQuery(searchQuerySchema)
 * async search(@ZodQuery(searchQuerySchema) query: SearchQuery) {
 *   return this.searchService.search(query);
 * }
 * ```
 */
declare function ApiZodQuery(schema: ZodType): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
/**
 * Decorator for documenting path parameters with Zod schema in Swagger
 * Automatically converts Zod object schema to individual path parameter definitions
 *
 * Use this decorator along with @ZodParam for complete validation and documentation
 *
 * @param schema - The Zod object schema for path parameters
 *
 * @example
 * ```typescript
 * import { ZodParam, ApiZodParam } from '@bniddam-labs/api-core/nestjs';
 * import { z } from 'zod';
 *
 * const userIdParamSchema = z.object({
 *   id: z.string().uuid().describe('User unique identifier'),
 * });
 *
 * type UserIdParam = z.infer<typeof userIdParamSchema>;
 *
 * @Get('users/:id')
 * @ApiZodParam(userIdParamSchema)
 * async findOne(@ZodParam(userIdParamSchema) params: UserIdParam) {
 *   return this.usersService.findOne(params.id);
 * }
 *
 * // Multiple params
 * const postParamsSchema = z.object({
 *   userId: z.string().uuid().describe('User ID'),
 *   postId: z.string().uuid().describe('Post ID'),
 * });
 *
 * @Get('users/:userId/posts/:postId')
 * @ApiZodParam(postParamsSchema)
 * async findUserPost(@ZodParam(postParamsSchema) params: z.infer<typeof postParamsSchema>) {
 *   return this.postsService.findUserPost(params.userId, params.postId);
 * }
 * ```
 */
declare function ApiZodParam(schema: ZodType): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;

/**
 * Zod schema for Swagger UI options
 */
declare const swaggerUiOptionsSchema: z.ZodObject<{
    persistAuthorization: z.ZodOptional<z.ZodBoolean>;
    displayRequestDuration: z.ZodOptional<z.ZodBoolean>;
    tagsSorter: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"alpha">, z.ZodFunction<z.core.$ZodFunctionArgs, z.core.$ZodFunctionOut>]>>;
    operationsSorter: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"alpha">, z.ZodLiteral<"method">, z.ZodFunction<z.core.$ZodFunctionArgs, z.core.$ZodFunctionOut>]>>;
}, z.core.$strip>;
/**
 * Zod schema for Swagger/OpenAPI setup options
 */
declare const swaggerSetupOptionsSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
    addBearerAuth: z.ZodOptional<z.ZodBoolean>;
    swaggerUiOptions: z.ZodOptional<z.ZodObject<{
        persistAuthorization: z.ZodOptional<z.ZodBoolean>;
        displayRequestDuration: z.ZodOptional<z.ZodBoolean>;
        tagsSorter: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"alpha">, z.ZodFunction<z.core.$ZodFunctionArgs, z.core.$ZodFunctionOut>]>>;
        operationsSorter: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"alpha">, z.ZodLiteral<"method">, z.ZodFunction<z.core.$ZodFunctionArgs, z.core.$ZodFunctionOut>]>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Configuration options for Swagger/OpenAPI setup
 */
type SwaggerSetupOptions = z.infer<typeof swaggerSetupOptionsSchema>;
/**
 * Sets up Swagger/OpenAPI documentation for a NestJS application
 *
 * Creates and configures Swagger UI with sensible defaults while allowing customization.
 * Automatically adds Bearer JWT authentication if enabled.
 *
 * @param app - The NestJS application instance
 * @param options - Configuration options for Swagger setup
 *
 * @example
 * ```typescript
 * import { setupSwagger } from '@bniddam-labs/api-core/nestjs';
 *
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 *
 *   // Basic setup with defaults
 *   setupSwagger(app);
 *
 *   // Custom setup
 *   setupSwagger(app, {
 *     title: 'My API',
 *     description: 'API for my application',
 *     version: '2.0',
 *     path: 'docs',
 *   });
 *
 *   await app.listen(3000);
 * }
 * ```
 */
declare function setupSwagger(app: INestApplication, options?: SwaggerSetupOptions): void;

export { AllExceptionsFilter, ApiCommonResponses, ApiErrorResponse, ApiPaginatedResponse, type ApiResponse, type ApiResponseDecoratorOptions, type ApiResponseMeta, ApiSuccessResponse, ApiZodBody, ApiZodParam, ApiZodQuery, type AuthenticatedRequest, type AuthenticatedUser, type ErrorResponse, HttpExceptionFilter, type IdParam, LoggingInterceptor, MAX_ITEMS_PER_PAGE, type OffsetPagination, type PaginatedResult, type PaginationMeta, type PaginationParams, type PaginationQuery, type PaginationQueryCoerce, type SlugParam, type SwaggerSetupOptions, ZodBody, ZodParam, ZodQuery, ZodValidationPipe, apiResponseDecoratorOptionsSchema, apiResponseMetaSchema, authenticatedUserSchema, calculatePaginationMeta, createApiResponseSchema, createPaginatedResult, createPaginatedResultSchema, errorResponseSchema, extractUuids, generateUniqueSlug, idParamSchema, isCustomIssue, isInvalidElement, isInvalidFormat, isInvalidKey, isInvalidType, isInvalidUnion, isInvalidValue, isNotMultipleOf, isTooBig, isTooSmall, isUnrecognizedKeys, isValidSlug, isValidUuid, isValidUuidV4, normalizePagination, offsetPaginationSchema, optionalSlugSchema, optionalUuidSchema, paginationMetaSchema, paginationParamsSchema, paginationQueryCoerceSchema, paginationQuerySchema, readInput, setupSwagger, slugParamSchema, slugSchema, slugify, swaggerSetupOptionsSchema, swaggerUiOptionsSchema, toOffsetPagination, uuidArraySchema, uuidSchema, uuidV4Schema };
