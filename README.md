# @bniddam/api-core

Generic HTTP API patterns for NestJS, including DTOs, Zod validation decorators, and Swagger/OpenAPI helpers.

## Features

- **Zod Validation Decorators**: Type-safe request validation with @ZodBody, @ZodQuery, @ZodParam
- **Standard DTOs**: Reusable DTOs for pagination, search, ID parameters
- **Swagger Helpers**: Automatic OpenAPI documentation generation
- **API Response Types**: Standardized response formats
- **TypeScript First**: Full type safety and IntelliSense
- **NestJS Integration**: Seamless integration with NestJS framework

## Installation

### Using pnpm link (local development)

```bash
# Make sure dependencies are linked first
cd /path/to/@bniddam/utils
pnpm install && pnpm build && pnpm link --global

cd /path/to/@bniddam/core
pnpm install && pnpm link --global @bniddam/utils
pnpm build && pnpm link --global

# In @bniddam/api-core directory
pnpm install
pnpm link --global @bniddam/core @bniddam/utils
pnpm build
pnpm link --global

# In your project
pnpm link --global @bniddam/api-core @bniddam/core @bniddam/utils
```

### Using npm/pnpm (when published)

```bash
pnpm add @bniddam/api-core @bniddam/core @bniddam/utils
# or
npm install @bniddam/api-core @bniddam/core @bniddam/utils
```

## Usage

### Zod Validation Decorators

```typescript
import { Controller, Post, Get } from '@nestjs/common';
import { ZodBody, ZodQuery, ZodParam } from '@bniddam/api-core/validation';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(18).optional(),
});

const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

const IdParamSchema = z.object({
  id: z.string().uuid(),
});

type CreateUserDto = z.infer<typeof CreateUserSchema>;
type PaginationDto = z.infer<typeof PaginationSchema>;
type IdParamDto = z.infer<typeof IdParamSchema>;

@Controller('users')
export class UsersController {
  @Post()
  create(@ZodBody(CreateUserSchema) body: CreateUserDto) {
    return { message: 'User created', data: body };
  }

  @Get()
  findAll(@ZodQuery(PaginationSchema) query: PaginationDto) {
    return { page: query.page, limit: query.limit };
  }

  @Get(':id')
  findOne(@ZodParam(IdParamSchema) params: IdParamDto) {
    return { id: params.id };
  }
}
```

### Standard DTOs

```typescript
import { PaginationQueryDto, PaginatedResponseDto, IdParamDto } from '@bniddam/api-core/dto';

@Controller('posts')
export class PostsController {
  @Get()
  async findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResponseDto<Post>> {
    const { page, limit } = query;
    const [data, total] = await this.postsService.findAndCount({ page, limit });

    return new PaginatedResponseDto(data, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }

  @Get(':id')
  async findOne(@Param() params: IdParamDto) {
    return this.postsService.findOne(params.id);
  }
}
```

### Swagger Integration

```typescript
import { ApiResponseDto } from '@bniddam/api-core/swagger';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  @Post('login')
  @ApiOkResponse(ApiResponseDto('Login successful', LoginResponseDto))
  @ApiBadRequestResponse(ApiResponseDto('Invalid credentials'))
  login(@ZodBody(LoginSchema) body: LoginDto) {
    return this.authService.login(body);
  }
}
```

### API Response Type

```typescript
import type { ApiResponse } from '@bniddam/api-core/http';

// Success response
const successResponse: ApiResponse<User> = {
  success: true,
  message: 'User fetched successfully',
  data: user,
};

// Error response
const errorResponse: ApiResponse = {
  success: false,
  message: 'User not found',
  error: 'NOT_FOUND',
};
```

## API Reference

### Validation Decorators (`@bniddam/api-core/validation`)

- `@ZodBody(schema)` - Validate request body with Zod schema
- `@ZodQuery(schema)` - Validate query parameters with Zod schema
- `@ZodParam(schema)` - Validate route parameters with Zod schema
- `ZodValidationPipe` - NestJS pipe for Zod validation

### DTOs (`@bniddam/api-core/dto`)

- `PaginationQueryDto` - Standard pagination query parameters
- `PaginatedResponseDto<T>` - Paginated response wrapper
- `SearchQueryDto` - Search with pagination
- `IdParamDto` - UUID parameter validation

### Swagger Helpers (`@bniddam/api-core/swagger`)

- `ApiResponseDto(message, type?)` - Create Swagger response decorators
- `setupSwagger(app, config)` - Configure Swagger/OpenAPI

### HTTP Types (`@bniddam/api-core/http`)

- `ApiResponse<T>` - Standard API response type
  - `success: boolean`
  - `message: string`
  - `data?: T`
  - `error?: string`
  - `meta?: Record<string, any>`

## Best Practices

### Validation

1. Define schemas once, reuse everywhere
2. Use `z.infer` to extract TypeScript types
3. Add custom error messages for better UX
4. Use `.transform()` for data transformation

```typescript
const UserSchema = z.object({
  email: z.string().email('Invalid email format'),
  age: z.string().transform(Number).pipe(z.number().min(18, 'Must be 18+')),
});
```

### Pagination

1. Always use `PaginationQueryDto` for consistency
2. Set reasonable defaults and limits
3. Return total count for client-side pagination
4. Use `PaginatedResponseDto` for standardized responses

### Swagger Documentation

1. Add `@Api*` decorators to all endpoints
2. Use `ApiResponseDto` for consistent response schemas
3. Document all error cases
4. Add examples for complex schemas

## Peer Dependencies

This package requires:

- `@nestjs/common`: ^11.0.0
- `@nestjs/swagger`: ^11.0.0

Install them in your project:

```bash
pnpm add @nestjs/common @nestjs/swagger
```

## Development

```bash
# Install dependencies
pnpm install

# Link dependencies (required)
pnpm link --global @bniddam/core @bniddam/utils

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

# Format
pnpm format
```

## Requirements

- Node.js >= 20
- pnpm >= 9
- NestJS >= 11

## License

MIT © bniddam
