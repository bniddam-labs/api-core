# Pipes Module

NestJS validation pipes powered by Zod.

## Overview

This module provides a powerful validation pipe that uses Zod schemas to validate request data with comprehensive error reporting and type safety.

## Exports

### `ZodValidationPipe`

A NestJS pipe that validates data against Zod schemas with detailed error logging in development.

**Features:**
- Type-safe validation using Zod schemas
- Comprehensive error logging in development mode
- Detailed validation error formatting for all Zod v4 issue types
- Automatic BadRequestException on validation failure
- Support for all Zod validation patterns

**Constructor:**

```typescript
constructor(schema: ZodTypeAny, schemaName?: string)
```

**Parameters:**
- `schema: ZodTypeAny` - The Zod schema to validate against
- `schemaName?: string` - Optional name for better error logging

**Usage:**

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ZodValidationPipe } from '@bniddam-labs/api-core';
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
  async create(
    @Body(new ZodValidationPipe(createUserSchema, 'createUserSchema'))
    dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }
}
```

**Recommended: Use with Zod Decorators**

Instead of using `ZodValidationPipe` directly, it's recommended to use the decorator shortcuts from the [decorators module](../decorators/README.md):

```typescript
import { Controller, Post } from '@nestjs/common';
import { ZodBody } from '@bniddam-labs/api-core';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

type CreateUserDto = z.infer<typeof createUserSchema>;

@Controller('users')
export class UsersController {
  @Post()
  async create(@ZodBody(createUserSchema) dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

## Error Handling

When validation fails, the pipe:
1. Logs detailed error information to the console (development only)
2. Throws a `BadRequestException` with message "Validation error"
3. The exception is caught by your global exception filter

**Development Error Log Example:**

```
────────────────────────────────────────────────────────────────────────────────
❌ [ZOD VALIDATION ERROR]
Schema: createUserSchema

Issues:
  • email: Invalid email
    └─ Expected: string
    └─ Input: "not-an-email"
  • age: Number must be greater than or equal to 18
    └─ Minimum: 18
    └─ Inclusive: true
    └─ Input: 15

Raw data received:
{
  "email": "not-an-email",
  "name": "John",
  "age": 15
}
────────────────────────────────────────────────────────────────────────────────
```

## Supported Zod Issue Types

The pipe provides detailed formatting for all Zod v4 validation issue types:

- **invalid_type** - Type mismatch errors
- **invalid_format** - Format validation errors (email, URL, etc.)
- **too_small** - Minimum length/value violations
- **too_big** - Maximum length/value violations
- **not_multiple_of** - Number multiple validation
- **unrecognized_keys** - Extra object properties
- **invalid_union** - Union/discriminated union errors
- **invalid_key** - Map/record key validation
- **invalid_element** - Array/set element validation
- **invalid_value** - Enum/literal value errors
- **custom** - Custom validation errors

## Type Guards

The module also exports type guards for checking Zod issue types:

```typescript
import {
  isInvalidType,
  isTooSmall,
  isTooBig,
  // ... other guards
} from '@bniddam-labs/api-core';
```

These are primarily used internally but are exported for advanced use cases.

## Best Practices

1. **Always name your schemas**: Provide `schemaName` parameter for easier debugging
2. **Use Zod decorators**: Prefer `@ZodBody`, `@ZodParam`, `@ZodQuery` over direct pipe usage
3. **Define schemas separately**: Create reusable schema definitions
4. **Leverage type inference**: Use `z.infer<typeof schema>` for DTOs
5. **Handle errors globally**: Use exception filters to format validation errors

## Complete Example

```typescript
// schemas/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100),
  age: z.number().int().min(18, 'Must be at least 18').optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

// users.controller.ts
import { Controller, Post } from '@nestjs/common';
import { ZodBody } from '@bniddam-labs/api-core';
import { createUserSchema, CreateUserDto } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  @Post()
  async create(@ZodBody(createUserSchema, 'createUserSchema') dto: CreateUserDto) {
    // dto is fully validated and typed
    return this.usersService.create(dto);
  }
}
```

## Related Modules

- [Decorators](../decorators/README.md) - Convenient decorator wrappers (`@ZodBody`, `@ZodParam`, `@ZodQuery`)
- [Filters](../filters/README.md) - Exception filters that handle validation errors
- [Schemas](../schemas/README.md) - Pre-built Zod schemas for common patterns
- [Types](../types/README.md) - TypeScript types for validation
