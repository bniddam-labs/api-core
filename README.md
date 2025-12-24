# @bniddam-labs/api-core

Framework-agnostic HTTP API patterns with NestJS adapters (Zod schemas, validation, Swagger helpers)

[![npm version](https://badge.fury.io/js/%40bniddam-labs%2Fapi-core.svg)](https://www.npmjs.com/package/@bniddam-labs/api-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Framework-Agnostic Core**: Zod schemas, types, and helpers that work anywhere
- **NestJS Integration**: First-class decorators, pipes, filters, and interceptors
- **Type-Safe Validation**: Powered by Zod with full TypeScript inference
- **Swagger/OpenAPI**: Automatic API documentation from Zod schemas
- **Standard Patterns**: Pagination, error handling, authentication
- **Winston Logger**: Production-ready logging with context and structured output
- **Production Ready**: Comprehensive logging, error handling, and security

## Installation

```bash
npm install @bniddam-labs/api-core zod

# For NestJS features (optional)
npm install @nestjs/common @nestjs/swagger
```

## Quick Start

### 1. Setup (NestJS)

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import {
  setupSwagger,
  AllExceptionsFilter,
  LoggingInterceptor,
  Logger,
} from '@bniddam-labs/api-core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Setup global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Setup Swagger documentation
  setupSwagger(app, {
    title: 'My API',
    description: 'API Documentation',
    version: '1.0.0',
  });

  await app.listen(3000);
  logger.log('API: http://localhost:3000');
  logger.log('Swagger: http://localhost:3000/api');
}
bootstrap();
```

### 2. Create Schemas

```typescript
// schemas/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email().describe('User email address'),
  name: z.string().min(1).max(100).describe('User full name'),
  age: z.number().int().min(18).optional().describe('User age'),
  role: z.enum(['user', 'admin']).default('user'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
```

### 3. Build Controllers

```typescript
// users.controller.ts
import { Controller, Get, Post, Param } from '@nestjs/common';
import {
  ZodBody,
  ZodParam,
  ZodQuery,
  ApiZodBody,
  ApiZodParam,
  ApiSuccessResponse,
  ApiCommonResponses,
  ApiPaginatedResponse,
  idParamSchema,
  paginationQueryCoerceSchema,
  createPaginatedResult,
} from '@bniddam-labs/api-core';
import type {
  IdParam,
  PaginationQueryCoerce,
} from '@bniddam-labs/api-core';
import { createUserSchema, CreateUserDto } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  @Get()
  @ApiPaginatedResponse(UserDto, 'Returns paginated list of users')
  async findAll(
    @ZodQuery(paginationQueryCoerceSchema) query: PaginationQueryCoerce
  ) {
    const [users, total] = await this.usersService.findAll(query);
    return createPaginatedResult(users, query, total);
  }

  @Get(':id')
  @ApiZodParam(idParamSchema)
  @ApiSuccessResponse({ status: 200, description: 'User found', type: UserDto })
  @ApiCommonResponses()
  async findOne(@ZodParam(idParamSchema) params: IdParam) {
    return this.usersService.findOne(params.id);
  }

  @Post()
  @ApiZodBody(createUserSchema, 'User creation data')
  @ApiSuccessResponse({ status: 201, description: 'User created', type: UserDto })
  async create(@ZodBody(createUserSchema) dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

## Module Documentation

This package is organized into focused modules, each with comprehensive documentation:

### Core Modules (Framework-Agnostic)

- **[Schemas](./src/schemas/README.md)** - Zod validation schemas for common API patterns (pagination, responses, auth, IDs, slugs)
- **[Types](./src/types/README.md)** - TypeScript type definitions inferred from schemas
- **[Helpers](./src/helpers/README.md)** - Utility functions for IDs, pagination, and slugs
- **[Logger](./src/logger/README.md)** - Winston-based logging with context and structured output

### NestJS Modules

- **[Decorators](./src/decorators/README.md)** - Parameter decorators for Zod validation (`@ZodBody`, `@ZodParam`, `@ZodQuery`)
- **[Pipes](./src/pipes/README.md)** - Validation pipes with comprehensive error logging
- **[Filters](./src/filters/README.md)** - Exception filters for consistent error handling
- **[Interceptors](./src/interceptors/README.md)** - Request/response interceptors (logging, monitoring)
- **[Swagger](./src/swagger/README.md)** - OpenAPI/Swagger decorators and setup utilities

## Core Concepts

### Type-Safe Validation

```typescript
import { z } from 'zod';
import { ZodBody } from '@bniddam-labs/api-core';

// Define schema once
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Type is automatically inferred
type LoginDto = z.infer<typeof loginSchema>;

// Use in controller
@Post('login')
async login(@ZodBody(loginSchema) dto: LoginDto) {
  // dto is fully typed and validated
  return this.authService.login(dto);
}
```

### Pagination

```typescript
import {
  ZodQuery,
  paginationQueryCoerceSchema,
  toOffsetPagination,
  createPaginatedResult,
} from '@bniddam-labs/api-core';
import type { PaginationQueryCoerce } from '@bniddam-labs/api-core';

@Get()
async findAll(@ZodQuery(paginationQueryCoerceSchema) query: PaginationQueryCoerce) {
  // Convert to offset pagination
  const { offset, limit } = toOffsetPagination(query);

  // Query database
  const [items, total] = await this.service.findMany(offset, limit);

  // Return paginated result
  return createPaginatedResult(items, query, total);
}
```

### Error Handling

```typescript
import { AllExceptionsFilter } from '@bniddam-labs/api-core';

// Apply globally
app.useGlobalFilters(new AllExceptionsFilter());

// All errors return consistent format:
// {
//   statusCode: 400,
//   message: "Validation failed",
//   error: "Bad Request",
//   timestamp: "2025-01-26T10:30:00.000Z",
//   path: "/api/users",
//   method: "POST"
// }
```

### Logging

```typescript
import { Logger } from '@bniddam-labs/api-core';

// Create logger with context
const logger = new Logger('UsersService');

// Log with different levels
logger.log('User created successfully');
logger.warn('Cache miss, using database');
logger.error('Database connection failed', error.stack);
logger.debug('Processing request', { userId: 123 });

// Configure via environment
// LOG_LEVEL=debug  # Show all logs including debug
// LOG_LEVEL=warn   # Only warnings and errors
// LOG_LEVEL=info   # Default level
```

### Swagger Documentation

```typescript
import {
  ApiZodBody,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '@bniddam-labs/api-core';

@Post()
@ApiZodBody(createUserSchema, 'User creation data')
@ApiSuccessResponse({ status: 201, description: 'User created', type: UserDto })
@ApiErrorResponse(400, 'Invalid request data')
async create(@ZodBody(createUserSchema) dto: CreateUserDto) {
  return this.service.create(dto);
}
```

## API Reference

### Validation Decorators

- `@ZodBody(schema, schemaName?)` - Validate request body
- `@ZodParam(schema, schemaName?)` - Validate route parameters
- `@ZodQuery(schema, schemaName?)` - Validate query parameters

### Swagger Decorators

- `@ApiZodBody(schema, description?)` - Document request body
- `@ApiZodParam(schema)` - Document path parameters
- `@ApiZodQuery(schema)` - Document query parameters
- `@ApiSuccessResponse(options)` - Document success responses
- `@ApiErrorResponse(status, description)` - Document error responses
- `@ApiPaginatedResponse(type, description)` - Document paginated responses
- `@ApiCommonResponses()` - Add common error responses

### Filters & Interceptors

- `AllExceptionsFilter` - Global exception handler
- `HttpExceptionFilter` - HTTP exception handler
- `LoggingInterceptor` - Request/response logging

### Helper Functions

**Pagination:**
- `normalizePagination(page?, limit?, maxLimit?)` - Normalize pagination params
- `toOffsetPagination(params)` - Convert to offset pagination
- `calculatePaginationMeta(params, total)` - Calculate pagination metadata
- `createPaginatedResult(data, params, total)` - Create paginated response

**IDs:**
- `isValidUuid(value)` - Validate UUID
- `isValidUuidV4(value)` - Validate UUID v4
- `extractUuids(text)` - Extract UUIDs from text

**Slugs:**
- `slugify(value, fallback?)` - Create URL-friendly slug
- `generateUniqueSlug(value, existingSlugs, fallback?)` - Create unique slug
- `isValidSlug(value)` - Validate slug format

### Pre-built Schemas

**Common:**
- `uuidSchema`, `uuidV4Schema`, `slugSchema`
- `idParamSchema`, `slugParamSchema`

**Pagination:**
- `paginationParamsSchema`, `paginationMetaSchema`
- `paginationQuerySchema`, `paginationQueryCoerceSchema`

**Responses:**
- `errorResponseSchema`, `apiResponseMetaSchema`
- `createApiResponseSchema(dataSchema)`
- `createPaginatedResultSchema(dataSchema)`

**Authentication:**
- `authenticatedUserSchema`

## Examples

Check the [module documentation](./src) for detailed examples:

- Complete CRUD API with pagination
- Custom validation schemas
- Error handling strategies
- Swagger documentation setup
- Authentication integration

## Requirements

- Node.js >= 20.0.0
- TypeScript >= 5.0
- Zod >= 4.0
- NestJS >= 11.0 (for NestJS features)

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Repository

[https://github.com/bniddam-labs/api-core](https://github.com/bniddam-labs/api-core)

## Issues

Report issues at [https://github.com/bniddam-labs/api-core/issues](https://github.com/bniddam-labs/api-core/issues)
