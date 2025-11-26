# @bniddam-labs/api-core

Framework-agnostic core schemas and NestJS utilities for building type-safe REST APIs.

## Features

- **Zod Schemas**: Type-safe validation schemas for common API patterns
- **Response Schemas**: Standardized success and error responses
- **Pagination**: Complete pagination schemas with search and sort
- **Auth Schemas**: Authentication and authorization schemas
- **NestJS Integration**: Swagger decorators, filters, interceptors, pipes
- **TypeScript First**: Full type safety and IntelliSense support

## Installation

```bash
pnpm add @bniddam-labs/api-core zod
# or
npm install @bniddam-labs/api-core zod
```

Peer dependencies (for NestJS integration):

```bash
pnpm add @nestjs/common @nestjs/core @nestjs/swagger rxjs reflect-metadata
```

## Quick Start

### Core Schemas (Framework-agnostic)

```typescript
import {
	// Common schemas
	uuidSchema,
	slugSchema,
	idParamSchema,

	// Response schemas
	errorResponseSchema,
	createApiResponseSchema,

	// Pagination schemas
	paginationQueryCoerceSchema,
	createPaginatedResultSchema,

	// Auth schemas
	authenticatedUserSchema,

	// Types
	type PaginationQuery,
	type PaginatedResult,
	type ErrorResponse,
} from '@bniddam-labs/api-core/core';

// Validate UUID
const userId = uuidSchema.parse('123e4567-e89b-12d3-a456-426614174000');

// Parse pagination query
const query = paginationQueryCoerceSchema.parse({
	page: '1',    // → 1 (number)
	limit: '10',  // → 10 (number)
	search: 'john',
	sortBy: 'createdAt',
	sortOrder: 'DESC',
});

// Create typed response schema
const userSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email(),
});

const userResponseSchema = createApiResponseSchema(userSchema);
const paginatedUsersSchema = createPaginatedResultSchema(userSchema);
```

### NestJS Integration

```typescript
import {
	ApiSuccessResponse,
	ApiErrorResponse,
	ApiCommonResponses,
	ApiPaginatedResponse,
} from '@bniddam-labs/api-core/nestjs';
import { paginationQueryCoerceSchema } from '@bniddam-labs/api-core/core';
import { createZodDto } from 'nestjs-zod';

class PaginationQueryDto extends createZodDto(paginationQueryCoerceSchema) {}

@Controller('users')
export class UsersController {
	@Get()
	@ApiPaginatedResponse(UserDto, 'Returns paginated list of users')
	@ApiCommonResponses()
	async findAll(@Query() query: PaginationQueryDto) {
		return this.usersService.findAll(query);
	}

	@Get(':id')
	@ApiSuccessResponse({
		status: 200,
		description: 'Returns a user',
		type: UserDto,
	})
	@ApiErrorResponse(404, 'User not found')
	@ApiCommonResponses()
	async findOne(@Param('id') id: string) {
		return this.usersService.findOne(id);
	}

	@Post()
	@ApiSuccessResponse({
		status: 201,
		description: 'User created',
		type: UserDto,
	})
	@ApiErrorResponse(400, 'Invalid request data')
	@ApiErrorResponse(409, 'Email already exists')
	async create(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto);
	}
}
```

## Package Structure

```
@bniddam-labs/api-core/
├── core/                  # Framework-agnostic schemas and types
│   ├── schemas/
│   │   ├── common.schema.ts      # UUIDs, slugs, IDs
│   │   ├── response.schema.ts    # API responses (success/error)
│   │   ├── pagination.schema.ts  # Pagination schemas
│   │   └── auth.schema.ts        # Authentication schemas
│   ├── types/            # TypeScript types
│   └── helpers/          # Utility functions
│
└── nestjs/               # NestJS-specific utilities
    ├── swagger/          # Swagger decorators
    ├── filters/          # Exception filters
    ├── interceptors/     # Response interceptors
    ├── pipes/            # Validation pipes
    └── decorators/       # Custom decorators
```

## Core Schemas

### Common Schemas

| Schema | Description | Example |
|--------|-------------|---------|
| `uuidSchema` | UUID validation (any version) | `'123e4567-e89b-12d3-a456-426614174000'` |
| `uuidV4Schema` | UUID v4 strict validation | `'550e8400-e29b-41d4-a716-446655440000'` |
| `slugSchema` | Slug validation | `'my-awesome-post'` |
| `idParamSchema` | Route parameter with UUID | `{ id: 'uuid' }` |
| `slugParamSchema` | Route parameter with slug | `{ slug: 'my-post' }` |

### Response Schemas

| Schema | Description |
|--------|-------------|
| `errorResponseSchema` | Standard error response format |
| `createApiResponseSchema(schema)` | Create typed success response |
| `apiResponseMetaSchema` | Response metadata |

### Pagination Schemas

| Schema | Description |
|--------|-------------|
| `paginationParamsSchema` | Page-based pagination |
| `offsetPaginationSchema` | Offset-based pagination |
| `paginationQuerySchema` | Pagination + search + sort |
| `paginationQueryCoerceSchema` | Auto-convert query strings |
| `paginationMetaSchema` | Pagination metadata for responses |
| `createPaginatedResultSchema(schema)` | Create typed paginated response |

### Auth Schemas

| Schema | Description |
|--------|-------------|
| `authenticatedUserSchema` | Authenticated user in request context |

## NestJS Decorators

### Swagger Decorators

| Decorator | Description |
|-----------|-------------|
| `@ApiSuccessResponse(options)` | Document success responses |
| `@ApiErrorResponse(status, description)` | Document error responses |
| `@ApiCommonResponses()` | Add common errors (400, 401, 403, 404, 429, 500) |
| `@ApiPaginatedResponse(dto, description)` | Document paginated responses |

### Other Utilities

- **Filters**: `AllExceptionsFilter`, `HttpExceptionFilter`
- **Interceptors**: `LoggingInterceptor`, `TransformInterceptor`
- **Pipes**: `ZodValidationPipe`

## Documentation

📚 **[Complete Documentation with Examples](./docs/SCHEMAS.md)**

The documentation includes:
- Detailed examples for all schemas
- NestJS integration patterns
- Complete CRUD example
- Best practices
- Type inference helpers

## Examples

### Pagination with Search & Sort

```typescript
import { paginationQueryCoerceSchema } from '@bniddam-labs/api-core/core';

// GET /api/users?page=2&limit=20&search=john&sortBy=createdAt&sortOrder=DESC
const query = paginationQueryCoerceSchema.parse(req.query);
// {
//   page: 2,
//   limit: 20,
//   search: 'john',
//   sortBy: 'createdAt',
//   sortOrder: 'DESC'
// }
```

### Creating Paginated Response

```typescript
import {
	createPaginatedResultSchema,
	type PaginatedResult,
} from '@bniddam-labs/api-core/core';

const userSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email(),
});

const paginatedUsersSchema = createPaginatedResultSchema(userSchema);

const response: PaginatedResult<User> = {
	data: users,
	meta: {
		page: 1,
		limit: 10,
		total: 100,
		totalPages: 10,
		hasNextPage: true,
		hasPreviousPage: false,
	},
};
```

### Error Response

```typescript
import { errorResponseSchema, type ErrorResponse } from '@bniddam-labs/api-core/core';

const error: ErrorResponse = {
	statusCode: 400,
	message: ['email must be valid', 'password too short'],
	error: 'Bad Request',
	timestamp: '2025-01-26T10:30:00.000Z',
	path: '/api/users',
	method: 'POST',
};
```

### Swagger Documentation

```typescript
@Get()
@ApiPaginatedResponse(UserDto, 'Returns paginated users')
@ApiCommonResponses()
async findAll(@Query() query: PaginationQueryDto) {
	// Auto-documented with Swagger
}
```

## Best Practices

### 1. Use Schema Validation

```typescript
// ✅ Good - Always validate inputs
const params = paginationQueryCoerceSchema.parse(req.query);

// ❌ Bad - No validation
const page = Number(req.query.page);
```

### 2. Type Inference

```typescript
// ✅ Good - Use inferred types
import { type PaginationQuery } from '@bniddam-labs/api-core/core';

// ❌ Bad - Manual types
type PaginationQuery = { page: number; limit: number };
```

### 3. Reuse Schemas

```typescript
// ✅ Good - Use factory functions
const userResponseSchema = createApiResponseSchema(userSchema);

// ❌ Bad - Duplicate schema definitions
const userResponseSchema = z.object({ data: userSchema, meta: ... });
```

### 4. Document APIs

```typescript
// ✅ Good - Full Swagger documentation
@ApiSuccessResponse({ status: 200, type: UserDto })
@ApiCommonResponses()

// ❌ Bad - No documentation
async findAll() { }
```

## TypeScript Support

All schemas export TypeScript types:

```typescript
import type {
	// Common types
	IdParam,
	SlugParam,

	// Response types
	ApiResponseMeta,
	ErrorResponse,

	// Pagination types
	PaginationParams,
	PaginationMeta,
	PaginationQuery,
	PaginatedResult,

	// Auth types
	AuthenticatedUser,
} from '@bniddam-labs/api-core/core';
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Requirements

- Node.js >= 20
- TypeScript >= 5.0
- Zod >= 3.22

For NestJS integration:
- @nestjs/common >= 10.0
- @nestjs/core >= 10.0
- @nestjs/swagger >= 7.0

## License

MIT © Benjamin Niddam
