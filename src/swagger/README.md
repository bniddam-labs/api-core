# Swagger Module

NestJS Swagger/OpenAPI utilities for API documentation.

## Overview

This module provides decorators and utilities to automatically generate comprehensive OpenAPI/Swagger documentation from your Zod schemas and NestJS controllers.

## Exports

### Setup Function

#### `setupSwagger(app, options?)`

Configures Swagger/OpenAPI documentation for your NestJS application with sensible defaults.

**Parameters:**
- `app: INestApplication` - Your NestJS application instance
- `options?: SwaggerSetupOptions` - Configuration options

**Options:**
- `title?: string` - API title (default: 'API Documentation')
- `description?: string` - API description (default: 'REST API documentation')
- `version?: string` - API version (default: '1.0')
- `path?: string` - Swagger UI path (default: 'api')
- `addBearerAuth?: boolean` - Add JWT Bearer auth (default: true)
- `swaggerUiOptions?: object` - Custom Swagger UI options

**Usage:**

```typescript
import { NestFactory } from '@nestjs/core';
import { setupSwagger } from '@bniddam-labs/api-core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Basic setup - accessible at http://localhost:3000/api
  setupSwagger(app);

  // Custom configuration
  setupSwagger(app, {
    title: 'My API',
    description: 'Complete API documentation for My App',
    version: '2.0.0',
    path: 'docs', // Accessible at http://localhost:3000/docs
    addBearerAuth: true,
    swaggerUiOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(3000);
}
bootstrap();
```

### Response Decorators

#### `@ApiSuccessResponse(options)`

Documents successful API responses in Swagger.

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiSuccessResponse } from '@bniddam-labs/api-core';

class UserDto {
  id: string;
  name: string;
  email: string;
}

@Controller('users')
export class UsersController {
  @Get()
  @ApiSuccessResponse({
    status: 200,
    description: 'Returns list of users',
    type: UserDto,
    isArray: true,
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiSuccessResponse({
    status: 200,
    description: 'Returns a single user',
    type: UserDto,
  })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
```

#### `@ApiErrorResponse(status, description)`

Documents error responses in Swagger using the standard error format.

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ApiErrorResponse } from '@bniddam-labs/api-core';

@Controller('users')
export class UsersController {
  @Post()
  @ApiErrorResponse(400, 'Invalid request data')
  @ApiErrorResponse(401, 'Unauthorized')
  @ApiErrorResponse(409, 'User already exists')
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

#### `@ApiCommonResponses()`

Adds common error responses (400, 401, 403, 404, 429, 500) to an endpoint.

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiCommonResponses } from '@bniddam-labs/api-core';

@Controller('users')
export class UsersController {
  @Get(':id')
  @ApiCommonResponses() // Adds all common error responses
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
```

#### `@ApiPaginatedResponse(dataType, description)`

Documents paginated responses with data array and pagination metadata.

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiPaginatedResponse, ZodQuery, paginationQueryCoerceSchema } from '@bniddam-labs/api-core';

class UserDto {
  id: string;
  name: string;
}

@Controller('users')
export class UsersController {
  @Get()
  @ApiPaginatedResponse(UserDto, 'Returns paginated list of users')
  async findAll(@ZodQuery(paginationQueryCoerceSchema) query) {
    return this.usersService.findAll(query);
  }
}
```

### Request Decorators

These decorators automatically convert Zod schemas to OpenAPI documentation.

#### `@ApiZodBody(schema, description?)`

Documents request body using a Zod schema.

```typescript
import { Controller, Post } from '@nestjs/common';
import { ApiZodBody, ZodBody } from '@bniddam-labs/api-core';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email().describe('User email address'),
  name: z.string().min(1).describe('User full name'),
  age: z.number().int().min(18).optional().describe('User age'),
  role: z.enum(['admin', 'user']).default('user'),
});

type CreateUserDto = z.infer<typeof createUserSchema>;

@Controller('users')
export class UsersController {
  @Post()
  @ApiZodBody(createUserSchema, 'User creation data')
  async create(@ZodBody(createUserSchema) dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

#### `@ApiZodQuery(schema)`

Documents query parameters using a Zod schema.

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiZodQuery, ZodQuery } from '@bniddam-labs/api-core';
import { z } from 'zod';

const searchQuerySchema = z.object({
  q: z.string().min(1).describe('Search query'),
  category: z.enum(['all', 'posts', 'users']).optional().default('all'),
  page: z.coerce.number().int().min(1).default(1).describe('Page number'),
  limit: z.coerce.number().int().min(1).max(100).default(10).describe('Items per page'),
});

type SearchQuery = z.infer<typeof searchQuerySchema>;

@Controller('search')
export class SearchController {
  @Get()
  @ApiZodQuery(searchQuerySchema)
  async search(@ZodQuery(searchQuerySchema) query: SearchQuery) {
    return this.searchService.search(query);
  }
}
```

#### `@ApiZodParam(schema)`

Documents path parameters using a Zod schema.

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiZodParam, ZodParam } from '@bniddam-labs/api-core';
import { z } from 'zod';

const userIdParamSchema = z.object({
  id: z.string().uuid().describe('User unique identifier'),
});

type UserIdParam = z.infer<typeof userIdParamSchema>;

@Controller('users')
export class UsersController {
  @Get(':id')
  @ApiZodParam(userIdParamSchema)
  async findOne(@ZodParam(userIdParamSchema) params: UserIdParam) {
    return this.usersService.findOne(params.id);
  }
}

// Multiple parameters
const postParamsSchema = z.object({
  userId: z.string().uuid().describe('User ID'),
  postId: z.string().uuid().describe('Post ID'),
});

@Controller('users')
export class PostsController {
  @Get(':userId/posts/:postId')
  @ApiZodParam(postParamsSchema)
  async findUserPost(@ZodParam(postParamsSchema) params: z.infer<typeof postParamsSchema>) {
    return this.postsService.findUserPost(params.userId, params.postId);
  }
}
```

## Complete Example

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { setupSwagger, AllExceptionsFilter } from '@bniddam-labs/api-core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Swagger documentation
  setupSwagger(app, {
    title: 'User Management API',
    description: 'Complete API for user management',
    version: '1.0.0',
    path: 'api-docs',
  });

  // Setup global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
  console.log('API Documentation: http://localhost:3000/api-docs');
}
bootstrap();

// users.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  ZodBody,
  ZodParam,
  ApiZodBody,
  ApiZodParam,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiCommonResponses,
  idParamSchema,
} from '@bniddam-labs/api-core';
import type { IdParam } from '@bniddam-labs/api-core';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email().describe('User email address'),
  name: z.string().min(1).max(100).describe('User full name'),
  role: z.enum(['user', 'admin']).default('user').describe('User role'),
});

type CreateUserDto = z.infer<typeof createUserSchema>;

class UserDto {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Controller('users')
export class UsersController {
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
  @ApiErrorResponse(400, 'Invalid user data')
  @ApiErrorResponse(409, 'User already exists')
  async create(@ZodBody(createUserSchema) dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

## Features

- **Automatic Schema Conversion**: Zod schemas are automatically converted to OpenAPI schemas
- **Type Safety**: Full TypeScript type inference from Zod schemas
- **Bearer Auth**: Built-in JWT Bearer authentication support
- **Standard Error Format**: Consistent error response documentation
- **Pagination Support**: Pre-built decorators for paginated responses
- **Description Support**: Use `.describe()` on Zod fields for better documentation

## Best Practices

1. **Use `.describe()` on Zod fields**: Provides better API documentation
2. **Combine validation and docs**: Use `@ApiZod*` decorators with `@Zod*` decorators
3. **Document all responses**: Include both success and error scenarios
4. **Use `@ApiCommonResponses()`**: Saves time documenting common errors
5. **Enable Bearer auth**: Set `addBearerAuth: true` for protected APIs

## Related Modules

- [Decorators](../decorators/README.md) - Validation decorators (`@ZodBody`, `@ZodParam`, `@ZodQuery`)
- [Schemas](../schemas/README.md) - Pre-built Zod schemas for documentation
- [Filters](../filters/README.md) - Exception filters using documented error format
