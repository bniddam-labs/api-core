import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { z, type ZodType } from 'zod';

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
export function ApiZodBody(schema: ZodType, description?: string) {
	// Convert Zod schema to OpenAPI-compatible JSON Schema
	const jsonSchema = z.toJSONSchema(schema, { target: 'openapi-3.0' });

	return applyDecorators(
		ApiBody({
			description: description || 'Request body',
			schema: jsonSchema as any,
		}),
	);
}

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
export function ApiZodQuery(schema: ZodType) {
	// Convert Zod schema to JSON Schema
	const jsonSchema = z.toJSONSchema(schema, { target: 'openapi-3.0' });

	// Query parameters must be object schemas
	if (jsonSchema.type !== 'object' || !jsonSchema.properties) {
		throw new Error('ApiZodQuery requires a Zod object schema');
	}

	const decorators = [];
	const properties = jsonSchema.properties as Record<string, any>;
	const required = (jsonSchema.required as string[]) || [];

	for (const [key, propertySchema] of Object.entries(properties)) {
		const isRequired = required.includes(key);

		// Extract description and example
		const fieldDescription = propertySchema.description || `Query parameter: ${key}`;
		const example = propertySchema.default !== undefined ? propertySchema.default : undefined;

		// Clean up the schema for OpenAPI (remove description as it's in the parameter level)
		const cleanSchema = { ...propertySchema };
		delete cleanSchema.description;

		decorators.push(
			ApiQuery({
				name: key,
				required: isRequired,
				description: fieldDescription,
				schema: cleanSchema as any,
				...(example !== undefined && { example }),
			}),
		);
	}

	return applyDecorators(...decorators);
}

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
export function ApiZodParam(schema: ZodType) {
	// Convert Zod schema to JSON Schema
	const jsonSchema = z.toJSONSchema(schema, { target: 'openapi-3.0' });

	// Path parameters must be object schemas
	if (jsonSchema.type !== 'object' || !jsonSchema.properties) {
		throw new Error('ApiZodParam requires a Zod object schema');
	}

	const decorators = [];
	const properties = jsonSchema.properties as Record<string, any>;

	for (const [key, propertySchema] of Object.entries(properties)) {
		// Extract description
		const fieldDescription = propertySchema.description || `Path parameter: ${key}`;

		// Clean up the schema for OpenAPI (remove description as it's in the parameter level)
		const cleanSchema = { ...propertySchema };
		delete cleanSchema.description;

		decorators.push(
			ApiParam({
				name: key,
				required: true, // Path parameters are always required
				description: fieldDescription,
				schema: cleanSchema as any,
			}),
		);
	}

	return applyDecorators(...decorators);
}
