# Helpers Module

Framework-agnostic utility functions for common API operations.

## Overview

This module provides pure TypeScript helper functions that are independent of any web framework. These utilities handle common tasks like ID validation, pagination calculations, and slug generation.

## Exports

### ID Helpers

Utilities for working with UUIDs.

#### `isValidUuid(value: string): boolean`

Validates if a string is a valid UUID (v1-v5).

```typescript
import { isValidUuid } from '@bniddam-labs/api-core';

isValidUuid('123e4567-e89b-12d3-a456-426614174000'); // true
isValidUuid('invalid'); // false
```

#### `isValidUuidV4(value: string): boolean`

Validates if a string is specifically a UUID v4.

```typescript
import { isValidUuidV4 } from '@bniddam-labs/api-core';

isValidUuidV4('550e8400-e29b-41d4-a716-446655440000'); // true
```

#### `extractUuids(text: string): string[]`

Extracts all UUIDs from a text string.

```typescript
import { extractUuids } from '@bniddam-labs/api-core';

const text = 'User 123e4567-e89b-12d3-a456-426614174000 created file abc-def';
extractUuids(text); // ['123e4567-e89b-12d3-a456-426614174000']
```

### Pagination Helpers

Utilities for handling pagination logic.

#### `toOffsetPagination(params: PaginationParams): OffsetPagination`

Converts page-based pagination to offset-based pagination for database queries.

```typescript
import { toOffsetPagination } from '@bniddam-labs/api-core';

const { offset, limit } = toOffsetPagination({ page: 2, limit: 10 });
// offset: 10, limit: 10
```

#### `calculatePaginationMeta(params: PaginationParams, total: number): PaginationMeta`

Calculates complete pagination metadata from total count.

```typescript
import { calculatePaginationMeta } from '@bniddam-labs/api-core';

const meta = calculatePaginationMeta({ page: 2, limit: 10 }, 45);
// {
//   page: 2,
//   limit: 10,
//   total: 45,
//   totalPages: 5,
//   hasNextPage: true,
//   hasPreviousPage: true
// }
```

#### `createPaginatedResult<T>(data: T[], params: PaginationParams, total: number): PaginatedResult<T>`

Creates a paginated response with data and metadata.

```typescript
import { createPaginatedResult } from '@bniddam-labs/api-core';

const users = await db.users.findMany({ skip: offset, take: limit });
const total = await db.users.count();

return createPaginatedResult(users, { page: 1, limit: 10 }, total);
// {
//   data: [...users],
//   meta: { page: 1, limit: 10, total, totalPages, hasNextPage, hasPreviousPage }
// }
```

#### `normalizePagination(page?: number, limit?: number, maxLimit?: number): PaginationParams`

Normalizes and validates pagination parameters with sensible defaults.

```typescript
import { normalizePagination } from '@bniddam-labs/api-core';

normalizePagination(0, 200);      // { page: 1, limit: 100 }
normalizePagination();            // { page: 1, limit: 10 }
normalizePagination(2, 20);       // { page: 2, limit: 20 }
normalizePagination(2, 20, 15);   // { page: 2, limit: 15 } (capped at maxLimit)
```

**Parameters:**
- `page` - Page number (default: 1, minimum: 1)
- `limit` - Items per page (default: 10, minimum: 1)
- `maxLimit` - Maximum allowed limit (default: 100)

### Slug Helpers

Utilities for creating and validating URL-friendly slugs.

#### `slugify(value: string, fallback?: string): string`

Converts a string to a URL-friendly slug.

**Features:**
- Removes diacritics (accents)
- Converts to lowercase
- Replaces non-alphanumeric characters with hyphens
- Removes leading/trailing hyphens
- Collapses multiple hyphens

```typescript
import { slugify } from '@bniddam-labs/api-core';

slugify('Hello World!');           // 'hello-world'
slugify('Café & Restaurant');      // 'cafe-restaurant'
slugify('---');                    // 'slug'
slugify('___', 'default');         // 'default'
```

#### `generateUniqueSlug(value: string, existingSlugs: string[], fallback?: string): string`

Generates a unique slug by appending a number if necessary.

```typescript
import { generateUniqueSlug } from '@bniddam-labs/api-core';

generateUniqueSlug('my-post', ['my-post', 'my-post-2']); // 'my-post-3'
generateUniqueSlug('new-post', ['other-post']);          // 'new-post'
```

#### `isValidSlug(value: string): boolean`

Validates if a string matches the slug format (lowercase alphanumeric with hyphens).

```typescript
import { isValidSlug } from '@bniddam-labs/api-core';

isValidSlug('hello-world');  // true
isValidSlug('Hello World');  // false
isValidSlug('hello_world');  // false
isValidSlug('-hello');       // false
```

## Complete Example: Paginated API Endpoint

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import {
  normalizePagination,
  toOffsetPagination,
  createPaginatedResult,
} from '@bniddam-labs/api-core';

@Controller('users')
export class UsersController {
  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    // Normalize and validate pagination params
    const params = normalizePagination(
      page ? Number.parseInt(page) : undefined,
      limit ? Number.parseInt(limit) : undefined,
    );

    // Convert to offset for database query
    const { offset, limit: take } = toOffsetPagination(params);

    // Query database
    const [users, total] = await Promise.all([
      this.usersService.findMany({ skip: offset, take }),
      this.usersService.count(),
    ]);

    // Return paginated result
    return createPaginatedResult(users, params, total);
  }
}
```

## Best Practices

1. **Use normalizePagination**: Always normalize user input to prevent invalid values
2. **Combine pagination helpers**: Use together for complete pagination logic
3. **Framework-agnostic**: These helpers work with any framework or database
4. **Type-safe**: Leverage TypeScript types from the [types module](../types/README.md)

## Related Modules

- [Schemas](../schemas/README.md) - Zod schemas for pagination and IDs
- [Types](../types/README.md) - TypeScript types for all helpers
- [Decorators](../decorators/README.md) - NestJS decorators using these helpers
