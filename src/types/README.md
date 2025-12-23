# Types Module

Framework-agnostic TypeScript type definitions.

## Overview

This module provides TypeScript type definitions re-exported from Zod schemas for convenient type-safe development. All types are inferred from Zod schemas to ensure consistency between validation and types.

## Exports

### Common Types

Basic types for identifiers and route parameters.

```typescript
import type { IdParam, SlugParam } from '@bniddam-labs/api-core';

// Route parameter with ID
const params: IdParam = {
  id: '123e4567-e89b-12d3-a456-426614174000'
};

// Route parameter with slug
const slugParams: SlugParam = {
  slug: 'my-awesome-post'
};
```

### Response Types

Types for API responses and errors.

#### `ApiResponseMeta`

Metadata for API responses (Record<string, unknown>).

```typescript
import type { ApiResponseMeta } from '@bniddam-labs/api-core';

const meta: ApiResponseMeta = {
  timestamp: '2025-01-26T10:30:00.000Z',
  version: '1.0',
  custom: 'value'
};
```

#### `ApiResponse<T>`

Generic API response wrapper with data and optional metadata.

```typescript
import type { ApiResponse } from '@bniddam-labs/api-core';

interface User {
  id: string;
  name: string;
  email: string;
}

const response: ApiResponse<User> = {
  data: {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com'
  },
  meta: {
    timestamp: '2025-01-26T10:30:00.000Z'
  }
};

// Array response
const listResponse: ApiResponse<User[]> = {
  data: [
    { id: '1', name: 'John', email: 'john@example.com' },
    { id: '2', name: 'Jane', email: 'jane@example.com' }
  ]
};
```

#### `ErrorResponse`

Standard error response structure.

```typescript
import type { ErrorResponse } from '@bniddam-labs/api-core';

const error: ErrorResponse = {
  statusCode: 400,
  message: 'Validation failed',
  error: 'Bad Request',
  timestamp: '2025-01-26T10:30:00.000Z',
  path: '/api/users',
  method: 'POST'
};

// Multiple error messages
const validationError: ErrorResponse = {
  statusCode: 400,
  message: ['Email is required', 'Name must be at least 1 character'],
  error: 'Bad Request',
  timestamp: '2025-01-26T10:30:00.000Z',
  path: '/api/users',
  method: 'POST'
};
```

### Pagination Types

Types for pagination handling.

#### `PaginationParams`

Page-based pagination parameters.

```typescript
import type { PaginationParams } from '@bniddam-labs/api-core';

const params: PaginationParams = {
  page: 1,
  limit: 10
};
```

#### `OffsetPagination`

Offset-based pagination parameters.

```typescript
import type { OffsetPagination } from '@bniddam-labs/api-core';

const offset: OffsetPagination = {
  offset: 0,
  limit: 10
};
```

#### `PaginationMeta`

Pagination metadata for responses.

```typescript
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

#### `PaginationQuery`

Extended pagination with search and sort.

```typescript
import type { PaginationQuery } from '@bniddam-labs/api-core';

const query: PaginationQuery = {
  page: 1,
  limit: 10,
  search: 'john',
  sortBy: 'createdAt',
  sortOrder: 'DESC'
};
```

#### `PaginationQueryCoerce`

Pagination query with automatic type coercion (for URL query parameters).

```typescript
import type { PaginationQueryCoerce } from '@bniddam-labs/api-core';

// Same structure as PaginationQuery but designed for coercion from strings
const query: PaginationQueryCoerce = {
  page: 1,       // Coerced from "1"
  limit: 10,     // Coerced from "10"
  search: 'john',
  sortBy: 'createdAt',
  sortOrder: 'DESC'
};
```

#### `PaginatedResult<T>`

Paginated response structure with data and metadata.

```typescript
import type { PaginatedResult } from '@bniddam-labs/api-core';

interface User {
  id: string;
  name: string;
}

const result: PaginatedResult<User> = {
  data: [
    { id: '1', name: 'John' },
    { id: '2', name: 'Jane' }
  ],
  meta: {
    page: 1,
    limit: 10,
    total: 25,
    totalPages: 3,
    hasNextPage: true,
    hasPreviousPage: false
  }
};
```

### Authentication Types

Types for authentication and user context.

#### `AuthenticatedUser`

User information attached to authenticated requests.

```typescript
import type { AuthenticatedUser } from '@bniddam-labs/api-core';

const user: AuthenticatedUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'user@example.com'
};
```

## Usage in NestJS

### Controller Example

```typescript
import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ZodParam,
  ZodQuery,
  idParamSchema,
  paginationQueryCoerceSchema,
  createPaginatedResult,
} from '@bniddam-labs/api-core';
import type {
  IdParam,
  PaginationQueryCoerce,
  PaginatedResult,
  ApiResponse,
} from '@bniddam-labs/api-core';

interface User {
  id: string;
  name: string;
  email: string;
}

@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@ZodParam(idParamSchema) params: IdParam): Promise<ApiResponse<User>> {
    const user = await this.usersService.findOne(params.id);
    return { data: user };
  }

  @Get()
  async findAll(
    @ZodQuery(paginationQueryCoerceSchema) query: PaginationQueryCoerce
  ): Promise<PaginatedResult<User>> {
    const [users, total] = await this.usersService.findAll(query);
    return createPaginatedResult(users, query, total);
  }
}
```

### Service Example

```typescript
import type {
  PaginationQueryCoerce,
  OffsetPagination,
  AuthenticatedUser,
} from '@bniddam-labs/api-core';
import { toOffsetPagination } from '@bniddam-labs/api-core';

@Injectable()
export class UsersService {
  async findAll(query: PaginationQueryCoerce): Promise<[User[], number]> {
    const { offset, limit }: OffsetPagination = toOffsetPagination(query);

    const users = await this.db.user.findMany({
      skip: offset,
      take: limit,
      where: query.search ? { name: { contains: query.search } } : undefined,
    });

    const total = await this.db.user.count();

    return [users, total];
  }

  async getCurrentUser(user: AuthenticatedUser): Promise<User> {
    return this.db.user.findUnique({ where: { id: user.id } });
  }
}
```

## Type-Safe Schema Inference

All types are derived from Zod schemas using `z.infer<typeof schema>`:

```typescript
import { z } from 'zod';
import { idParamSchema } from '@bniddam-labs/api-core';

// Type is inferred from schema
type IdParam = z.infer<typeof idParamSchema>;
// Equivalent to: { id: string }

// You can also import the pre-defined type
import type { IdParam } from '@bniddam-labs/api-core';
```

## Best Practices

1. **Import types separately**: Use `import type` for type-only imports (better tree-shaking)
2. **Prefer exported types**: Use module types instead of inferring manually
3. **Use generics**: Leverage `ApiResponse<T>` and `PaginatedResult<T>` for reusable code
4. **Schema-first**: Define Zod schemas first, then infer types
5. **Consistent responses**: Always use standard response types for API consistency

## Related Modules

- [Schemas](../schemas/README.md) - Zod schemas that these types are derived from
- [Helpers](../helpers/README.md) - Helper functions using these types
- [Decorators](../decorators/README.md) - NestJS decorators using these types
