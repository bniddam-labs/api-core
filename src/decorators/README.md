# Decorators Module

NestJS parameter decorators for Zod validation.

## Overview

This module provides custom decorators that combine NestJS parameter extraction with Zod schema validation, simplifying input validation in your controllers.

## Exports

### `@ZodBody(schema, schemaName?)`

Combines `@Body()` decorator with Zod validation for request body data.

**Parameters:**
- `schema: ZodType` - The Zod schema to validate against
- `schemaName?: string` - Optional name for better error logging in development

**Usage:**

```typescript
import { Controller, Post } from '@nestjs/common';
import { ZodBody } from '@bniddam-labs/api-core';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  age: z.number().int().min(18).optional(),
});

type CreateUserDto = z.infer<typeof createUserSchema>;

@Controller('users')
export class UsersController {
  @Post()
  async create(@ZodBody(createUserSchema) dto: CreateUserDto) {
    // dto is fully typed and validated
    return this.usersService.create(dto);
  }

  // With schema name for better dev logging
  @Post('register')
  async register(@ZodBody(createUserSchema, 'createUserSchema') dto: CreateUserDto) {
    return this.usersService.register(dto);
  }
}
```

### `@ZodParam(schema, schemaName?)`

Combines `@Param()` decorator with Zod validation for route parameters.

**Parameters:**
- `schema: ZodType` - The Zod schema to validate against
- `schemaName?: string` - Optional name for better error logging

**Usage:**

```typescript
import { Controller, Get } from '@nestjs/common';
import { ZodParam } from '@bniddam-labs/api-core';
import { idParamSchema } from '@bniddam-labs/api-core';
import type { IdParam } from '@bniddam-labs/api-core';

@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@ZodParam(idParamSchema) params: IdParam) {
    // params.id is validated as a valid ID (number or UUID)
    return this.usersService.findOne(params.id);
  }
}
```

### `@ZodQuery(schema, schemaName?)`

Combines `@Query()` decorator with Zod validation for query parameters.

**Parameters:**
- `schema: ZodType` - The Zod schema to validate against
- `schemaName?: string` - Optional name for better error logging

**Usage:**

```typescript
import { Controller, Get } from '@nestjs/common';
import { ZodQuery } from '@bniddam-labs/api-core';
import { paginationQueryCoerceSchema } from '@bniddam-labs/api-core';
import type { PaginationQueryCoerce } from '@bniddam-labs/api-core';

@Controller('users')
export class UsersController {
  @Get()
  async findAll(@ZodQuery(paginationQueryCoerceSchema) query: PaginationQueryCoerce) {
    // query.page and query.limit are validated and coerced to numbers
    return this.usersService.findAll(query);
  }
}
```

## Features

- **Type Safety**: Full TypeScript type inference from Zod schemas
- **Automatic Validation**: Request data is validated before reaching your handler
- **Dev-Friendly Logging**: Detailed validation errors in development mode
- **Schema Naming**: Optional schema names for easier debugging
- **Production Ready**: Sanitized error messages in production

## Error Handling

When validation fails:
- A `BadRequestException` is thrown automatically
- In **development**: Detailed validation errors are logged to console
- In **production**: Generic error messages protect sensitive data

## Best Practices

1. **Define schemas once**: Create reusable Zod schemas in a dedicated file
2. **Use type inference**: Leverage `z.infer<typeof schema>` for DTOs
3. **Name your schemas**: Add schema names in development for easier debugging
4. **Combine with Swagger**: Use with `@ApiBody()`, `@ApiParam()`, `@ApiQuery()` decorators

## Related Modules

- [Pipes](../pipes/README.md) - `ZodValidationPipe` used internally by these decorators
- [Schemas](../schemas/README.md) - Pre-built Zod schemas for common patterns
- [Swagger](../swagger/README.md) - API documentation decorators
