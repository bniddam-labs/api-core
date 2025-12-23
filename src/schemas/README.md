# Schemas Module

Framework-agnostic Zod validation schemas for common API patterns.

## Overview

This module provides reusable Zod schemas for validation, type inference, and API standardization. All schemas are framework-agnostic and can be used with any TypeScript project.

## Exports

### Common Schemas

Basic schemas for identifiers and route parameters.

#### UUID Schemas

```typescript
import { uuidSchema, uuidV4Schema, optionalUuidSchema, uuidArraySchema } from '@bniddam-labs/api-core';

// UUID validation (any version)
uuidSchema.parse('123e4567-e89b-12d3-a456-426614174000'); // ✓

// UUID v4 validation (strict)
uuidV4Schema.parse('550e8400-e29b-41d4-a716-446655440000'); // ✓

// Optional UUID (nullable or undefined)
optionalUuidSchema.parse(null); // ✓
optionalUuidSchema.parse(undefined); // ✓

// Array of UUIDs
uuidArraySchema.parse(['uuid1', 'uuid2']); // ✓
```

#### Slug Schemas

```typescript
import { slugSchema, optionalSlugSchema } from '@bniddam-labs/api-core';

// Slug validation (lowercase alphanumeric with hyphens)
slugSchema.parse('my-awesome-post'); // ✓
slugSchema.parse('user-profile-123'); // ✓

// Optional slug
optionalSlugSchema.parse(null); // ✓
```

#### Route Parameter Schemas

Pre-built schemas for common route parameters.

```typescript
import { idParamSchema, slugParamSchema } from '@bniddam-labs/api-core';
import type { IdParam, SlugParam } from '@bniddam-labs/api-core';

// ID parameter (e.g., GET /users/:id)
@Get(':id')
async findOne(@ZodParam(idParamSchema) params: IdParam) {
  // params.id is a valid UUID
  return this.usersService.findOne(params.id);
}

// Slug parameter (e.g., GET /posts/:slug)
@Get(':slug')
async findBySlug(@ZodParam(slugParamSchema) params: SlugParam) {
  // params.slug is a valid slug
  return this.postsService.findBySlug(params.slug);
}
```

### Response Schemas

Standardized schemas for API responses.

#### Success Response

```typescript
import { createApiResponseSchema, apiResponseMetaSchema } from '@bniddam-labs/api-core';
import { z } from 'zod';

// Define your data schema
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
});

// Create typed response schema
const userResponseSchema = createApiResponseSchema(userSchema);

type UserResponse = z.infer<typeof userResponseSchema>;
// {
//   data: { id: string, name: string, email: string },
//   meta?: Record<string, unknown>
// }
```

#### Error Response

```typescript
import { errorResponseSchema } from '@bniddam-labs/api-core';
import type { ErrorResponse } from '@bniddam-labs/api-core';

// Standard error response structure
const error: ErrorResponse = {
  statusCode: 400,
  message: 'Validation failed',
  error: 'Bad Request',
  timestamp: '2025-01-26T10:30:00.000Z',
  path: '/api/users',
  method: 'POST'
};
```

### Pagination Schemas

Comprehensive schemas for pagination handling.

#### Basic Pagination

```typescript
import { paginationParamsSchema, offsetPaginationSchema } from '@bniddam-labs/api-core';
import type { PaginationParams, OffsetPagination } from '@bniddam-labs/api-core';

// Page-based pagination
const pageParams: PaginationParams = { page: 1, limit: 10 };

// Offset-based pagination
const offsetParams: OffsetPagination = { offset: 0, limit: 10 };
```

#### Pagination Metadata

```typescript
import { paginationMetaSchema } from '@bniddam-labs/api-core';
import type { PaginationMeta } from '@bniddam-labs/api-core';

const meta: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 100,
  totalPages: 10,
  hasNextPage: true,
  hasPreviousPage: false
};
```

#### Paginated Result

```typescript
import { createPaginatedResultSchema } from '@bniddam-labs/api-core';
import { z } from 'zod';

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

// Create paginated response schema
const paginatedUsersSchema = createPaginatedResultSchema(userSchema);

type PaginatedUsers = z.infer<typeof paginatedUsersSchema>;
// {
//   data: User[],
//   meta: PaginationMeta
// }
```

#### Query Parameter Schemas

Schemas for parsing pagination from query strings.

```typescript
import { paginationQuerySchema, paginationQueryCoerceSchema } from '@bniddam-labs/api-core';
import type { PaginationQuery, PaginationQueryCoerce } from '@bniddam-labs/api-core';

// Standard pagination query
const query: PaginationQuery = {
  page: 1,
  limit: 10,
  search: 'john',
  sortBy: 'createdAt',
  sortOrder: 'DESC'
};

// Coerced query (for URL query parameters)
// GET /api/users?page=1&limit=10&search=john
@Get()
async findAll(@ZodQuery(paginationQueryCoerceSchema) query: PaginationQueryCoerce) {
  // query.page and query.limit are automatically coerced to numbers
  return this.usersService.findAll(query);
}
```

**Constants:**
- `MAX_ITEMS_PER_PAGE = 100` - Maximum allowed items per page

### Authentication Schemas

Schemas for authentication and user context.

```typescript
import { authenticatedUserSchema } from '@bniddam-labs/api-core';
import type { AuthenticatedUser } from '@bniddam-labs/api-core';

// Authenticated user attached to request
const user: AuthenticatedUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'user@example.com'
};

// Use in NestJS guard
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = authenticatedUserSchema.parse(request.user);
    request.user = user;
    return true;
  }
}
```

## Complete Example: API Endpoint with Pagination

```typescript
import { Controller, Get } from '@nestjs/common';
import {
  ZodQuery,
  paginationQueryCoerceSchema,
  createPaginatedResultSchema,
  toOffsetPagination,
  createPaginatedResult,
} from '@bniddam-labs/api-core';
import type { PaginationQueryCoerce } from '@bniddam-labs/api-core';
import { z } from 'zod';

// Define your entity schema
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
});

// Create paginated response schema
const paginatedUsersSchema = createPaginatedResultSchema(userSchema);

@Controller('users')
export class UsersController {
  @Get()
  async findAll(@ZodQuery(paginationQueryCoerceSchema) query: PaginationQueryCoerce) {
    // Convert to offset pagination
    const { offset, limit } = toOffsetPagination(query);

    // Query database with offset and limit
    const [users, total] = await Promise.all([
      this.db.user.findMany({
        skip: offset,
        take: limit,
        where: query.search ? { name: { contains: query.search } } : undefined,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : undefined,
      }),
      this.db.user.count(),
    ]);

    // Return paginated result
    return createPaginatedResult(users, query, total);
  }
}
```

## Schema Composition

All schemas can be composed and extended using Zod's built-in methods:

```typescript
import { paginationQueryCoerceSchema } from '@bniddam-labs/api-core';
import { z } from 'zod';

// Extend pagination schema with custom filters
const userListQuerySchema = paginationQueryCoerceSchema.extend({
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

type UserListQuery = z.infer<typeof userListQuerySchema>;
// {
//   page: number,
//   limit: number,
//   search?: string,
//   sortBy?: string,
//   sortOrder: 'ASC' | 'DESC',
//   role?: 'user' | 'admin',
//   status?: 'active' | 'inactive'
// }
```

## Best Practices

1. **Use schema factories**: Leverage `createApiResponseSchema` and `createPaginatedResultSchema` for consistency
2. **Coerce query parameters**: Use `paginationQueryCoerceSchema` for URL query params
3. **Extend schemas**: Build on base schemas for custom validation
4. **Type inference**: Always use `z.infer<typeof schema>` for TypeScript types
5. **Reuse schemas**: Import and compose schemas across your application

## Related Modules

- [Types](../types/README.md) - Type exports for all schemas
- [Helpers](../helpers/README.md) - Helper functions using these schemas
- [Decorators](../decorators/README.md) - NestJS decorators for schema validation
- [Swagger](../swagger/README.md) - OpenAPI documentation using schemas
