# @bniddam-labs/api-core - Documentation

Complete documentation for the api-core package.

## Table of Contents

### 📖 Core Documentation

- **[Schemas Documentation](./SCHEMAS.md)** - Complete guide with examples for all Zod schemas
  - Common schemas (UUID, slug, ID, search)
  - Response schemas (success, error)
  - Pagination schemas (page-based, offset-based, with search & sort)
  - Auth schemas (authenticated user)
  - NestJS integration examples
  - Complete CRUD example
  - Best practices

## Quick Links

### Common Schemas
- [UUID Validation](./SCHEMAS.md#uuid-validation)
- [Slug Validation](./SCHEMAS.md#slug-validation)
- [ID Parameters](./SCHEMAS.md#id-parameter-route-params)
- [Slug Parameters](./SCHEMAS.md#slug-parameter-route-params)

### Response Schemas
- [API Response Metadata](./SCHEMAS.md#api-response-metadata)
- [Typed API Response](./SCHEMAS.md#typed-api-response)
- [Error Response](./SCHEMAS.md#error-response)

### Pagination
- [Basic Pagination](./SCHEMAS.md#basic-pagination)
- [Offset Pagination](./SCHEMAS.md#offset-pagination)
- [Pagination with Search & Sort](./SCHEMAS.md#pagination-avec-search--sort)
- [Query String Coercion](./SCHEMAS.md#pagination-avec-coercion-query-strings)
- [Paginated Results](./SCHEMAS.md#paginated-result-response)

### NestJS Integration
- [Swagger Decorators](./SCHEMAS.md#swagger-decorators)
- [Complete CRUD Example](./SCHEMAS.md#complete-example-user-crud)
- [Exception Filters](./SCHEMAS.md#avec-nestjs-exception-filters)
- [Guards & Decorators](./SCHEMAS.md#avec-nestjs-guards)

## Overview

### Core Package Structure

```
src/
├── core/                    # Framework-agnostic
│   ├── schemas/
│   │   ├── common.schema.ts      # UUID, slug, ID
│   │   ├── response.schema.ts    # API responses
│   │   ├── pagination.schema.ts  # Pagination
│   │   └── auth.schema.ts        # Authentication
│   ├── types/
│   │   └── index.ts              # Type exports
│   └── helpers/
│       ├── id.helpers.ts
│       ├── slug.helpers.ts
│       └── pagination.helpers.ts
│
└── nestjs/                  # NestJS-specific
    ├── swagger/
    │   ├── api-response.decorators.ts
    │   └── index.ts
    ├── filters/
    ├── interceptors/
    ├── pipes/
    └── decorators/
```

### Key Features

1. **Framework-agnostic Core**
   - Zod schemas for validation
   - TypeScript types
   - Helper functions
   - Reusable across any framework

2. **NestJS Integration**
   - Swagger decorators for API documentation
   - Exception filters for error handling
   - Interceptors for response transformation
   - Validation pipes
   - Custom decorators

3. **Type Safety**
   - Full TypeScript support
   - Type inference from Zod schemas
   - IntelliSense support
   - Compile-time validation

4. **Standardization**
   - Consistent API response formats
   - Standardized error responses
   - Unified pagination approach
   - Common validation patterns

## Usage Examples

### Basic Import

```typescript
// Core schemas (framework-agnostic)
import {
	uuidSchema,
	paginationQueryCoerceSchema,
	createApiResponseSchema,
	type PaginationQuery,
} from '@bniddam-labs/api-core/core';

// NestJS utilities
import {
	ApiSuccessResponse,
	ApiPaginatedResponse,
} from '@bniddam-labs/api-core/nestjs';
```

### Common Patterns

#### 1. Validate Query Parameters

```typescript
const query = paginationQueryCoerceSchema.parse(req.query);
// Automatically converts strings to numbers with defaults
```

#### 2. Create Typed Response

```typescript
const responseSchema = createApiResponseSchema(userSchema);
type UserResponse = z.infer<typeof responseSchema>;
```

#### 3. Document with Swagger

```typescript
@ApiPaginatedResponse(UserDto, 'Returns users')
@ApiCommonResponses()
async findAll() { }
```

## Migration Guide

If you're upgrading from an older version, here are the key changes:

### Schema Organization

**Old structure:**
- `id.schema.ts` - Mixed UUID, slug, search
- `api-response.schema.ts` - Mixed responses and auth

**New structure:**
- `common.schema.ts` - UUID, slug, ID, search
- `response.schema.ts` - API responses only
- `auth.schema.ts` - Authentication only
- `pagination.schema.ts` - Pagination (enhanced)

### Import Changes

**Before:**
```typescript
import { uuidSchema } from '@bniddam-labs/api-core/core/schemas/id.schema';
```

**After:**
```typescript
import { uuidSchema } from '@bniddam-labs/api-core/core';
```

All exports are now consolidated in the main index files.

## Contributing

When adding new schemas or utilities:

1. **Add schema to appropriate file:**
   - Common validations → `common.schema.ts`
   - API responses → `response.schema.ts`
   - Pagination → `pagination.schema.ts`
   - Auth → `auth.schema.ts`

2. **Export TypeScript types:**
   ```typescript
   export type MyType = z.infer<typeof mySchema>;
   ```

3. **Add documentation:**
   - JSDoc comments on schemas
   - Examples in `SCHEMAS.md`
   - Update this README if needed

4. **Add tests:**
   - Unit tests for schemas
   - Integration tests for NestJS utilities

## Additional Resources

- [Main README](../README.md) - Package overview
- [Zod Documentation](https://zod.dev) - Zod validation library
- [NestJS Documentation](https://docs.nestjs.com) - NestJS framework
- [Swagger/OpenAPI](https://swagger.io/specification/) - API documentation

## Support

For issues, questions, or contributions:
- GitHub Issues: [bniddam-labs/api-core](https://github.com/bniddam-labs/api-core/issues)
- Documentation: [./SCHEMAS.md](./SCHEMAS.md)
