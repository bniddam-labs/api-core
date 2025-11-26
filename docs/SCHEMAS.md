# Schemas Documentation

Guide complet pour l'utilisation des schémas Zod dans `@bniddam-labs/api-core`.

## Table des matières

- [Common Schemas](#common-schemas)
- [Response Schemas](#response-schemas)
- [Pagination Schemas](#pagination-schemas)
- [Auth Schemas](#auth-schemas)
- [NestJS Integration](#nestjs-integration)

---

## Common Schemas

Schémas réutilisables pour les validations courantes (UUIDs, slugs, IDs).

**Important**: Tous les imports se font depuis `@bniddam-labs/api-core/core` (pas de sous-chemins).

### UUID Validation

```typescript
import { uuidSchema, uuidV4Schema, optionalUuidSchema, uuidArraySchema } from '@bniddam-labs/api-core/core';

// Valider n'importe quelle version d'UUID
const userId = uuidSchema.parse('123e4567-e89b-12d3-a456-426614174000');

// Valider strictement UUID v4
const id = uuidV4Schema.parse('550e8400-e29b-41d4-a716-446655440000');

// UUID optionnel (peut être null/undefined)
const optionalId = optionalUuidSchema.parse(null); // ✅ OK
const optionalId2 = optionalUuidSchema.parse('123e4567-e89b-12d3-a456-426614174000'); // ✅ OK

// Tableau d'UUIDs
const ids = uuidArraySchema.parse([
	'123e4567-e89b-12d3-a456-426614174000',
	'550e8400-e29b-41d4-a716-446655440000',
]);
```

### Slug Validation

```typescript
import { slugSchema } from '@bniddam-labs/api-core/core';

// Valider un slug (lowercase alphanumeric avec hyphens)
const slug = slugSchema.parse('my-awesome-post'); // ✅ OK
const slug2 = slugSchema.parse('user-profile-123'); // ✅ OK

// Invalides
slugSchema.parse('My-Post'); // ❌ Erreur (majuscules)
slugSchema.parse('post_name'); // ❌ Erreur (underscores)
slugSchema.parse('post--name'); // ❌ Erreur (double hyphens)
```

### ID Parameter (Route Params)

```typescript
import { idParamSchema, type IdParam } from '@bniddam-labs/api-core/core';

// Valider les paramètres de route avec UUID
const params = idParamSchema.parse({
	id: '123e4567-e89b-12d3-a456-426614174000'
});

// Avec NestJS
@Get(':id')
async findOne(@Param() params: IdParam) {
	// params.id est validé et typé comme UUID
	return this.service.findOne(params.id);
}
```

### Slug Parameter (Route Params)

```typescript
import { slugParamSchema, type SlugParam } from '@bniddam-labs/api-core/core';

// Valider les paramètres de route avec slug
const params = slugParamSchema.parse({
	slug: 'my-awesome-post'
});

// Avec NestJS
@Get(':slug')
async findBySlug(@Param() params: SlugParam) {
	// params.slug est validé et typé comme slug
	return this.service.findBySlug(params.slug);
}

// Exemple complet avec DTO
import { createZodDto } from 'nestjs-zod';

class PostSlugDto extends createZodDto(slugParamSchema) {}

@Controller('posts')
export class PostsController {
	@Get(':slug')
	async findOne(@Param() params: PostSlugDto) {
		// params.slug: 'my-post' (validé)
		return this.postsService.findBySlug(params.slug);
	}
}
```

---

## Response Schemas

Schémas pour les réponses API (succès et erreurs).

### API Response Metadata

```typescript
import { apiResponseMetaSchema, type ApiResponseMeta } from '@bniddam-labs/api-core/core';

// Metadata flexible (clé-valeur)
const meta: ApiResponseMeta = {
	requestId: '123',
	timestamp: new Date().toISOString(),
	version: '1.0',
	custom: { foo: 'bar' },
};
```

### Typed API Response

```typescript
import { createApiResponseSchema } from '@bniddam-labs/api-core/core';
import { z } from 'zod';

// Définir un schéma de données
const userSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email(),
});

// Créer un schéma de réponse typé
const userResponseSchema = createApiResponseSchema(userSchema);

type UserResponse = z.infer<typeof userResponseSchema>;
// {
//   data: { id: string; name: string; email: string; }
//   meta?: Record<string, unknown>
// }

// Exemple de réponse
const response: UserResponse = {
	data: {
		id: '123e4567-e89b-12d3-a456-426614174000',
		name: 'John Doe',
		email: 'john@example.com',
	},
	meta: {
		requestId: 'req-123',
	},
};
```

### Error Response

```typescript
import { errorResponseSchema, type ErrorResponse } from '@bniddam-labs/api-core/core';

// Validation erreur simple
const error: ErrorResponse = {
	statusCode: 400,
	message: 'Validation failed',
	error: 'Bad Request',
	timestamp: '2025-01-26T10:30:00.000Z',
	path: '/api/users',
	method: 'POST',
};

// Erreur avec messages multiples (validation)
const validationError: ErrorResponse = {
	statusCode: 400,
	message: [
		'email must be a valid email',
		'password must be at least 8 characters',
	],
	error: 'Bad Request',
};

// Valider une réponse d'erreur
const validated = errorResponseSchema.parse(error);
```

### Avec NestJS Exception Filters

```typescript
import { ErrorResponse } from '@bniddam-labs/api-core/core';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();
		const status = exception.getStatus();

		const errorResponse: ErrorResponse = {
			statusCode: status,
			message: exception.message,
			error: exception.name,
			timestamp: new Date().toISOString(),
			path: request.url,
			method: request.method,
		};

		response.status(status).json(errorResponse);
	}
}
```

---

## Pagination Schemas

Schémas pour la pagination des résultats.

### Basic Pagination

```typescript
import {
	paginationParamsSchema,
	type PaginationParams
} from '@bniddam-labs/api-core/core';

// Pagination par page
const params: PaginationParams = paginationParamsSchema.parse({
	page: 1,
	limit: 10,
});

// Avec NestJS DTO
import { createZodDto } from 'nestjs-zod';

class PaginationDto extends createZodDto(paginationParamsSchema) {}

@Get()
async findAll(@Query() pagination: PaginationDto) {
	// pagination.page et pagination.limit sont validés
	return this.service.findAll(pagination);
}
```

### Offset Pagination

```typescript
import {
	offsetPaginationSchema,
	type OffsetPagination
} from '@bniddam-labs/api-core/core';

// Alternative: pagination par offset
const params: OffsetPagination = offsetPaginationSchema.parse({
	offset: 0,
	limit: 10,
});

// Deuxième page (offset 10)
const page2: OffsetPagination = {
	offset: 10,
	limit: 10,
};
```

### Pagination avec Search & Sort

```typescript
import {
	paginationQuerySchema,
	type PaginationQuery
} from '@bniddam-labs/api-core/core';

// Query complète avec search et sort
const query: PaginationQuery = paginationQuerySchema.parse({
	page: 1,
	limit: 10,
	search: 'john',
	sortBy: 'createdAt',
	sortOrder: 'DESC',
});

// Avec NestJS
class PaginationQueryDto extends createZodDto(paginationQuerySchema) {}

@Get()
async findAll(@Query() query: PaginationQueryDto) {
	return this.service.findAll({
		page: query.page,
		limit: query.limit,
		search: query.search,
		sortBy: query.sortBy,
		sortOrder: query.sortOrder,
	});
}
```

### Pagination avec Coercion (Query Strings)

```typescript
import {
	paginationQueryCoerceSchema,
	type PaginationQueryCoerce
} from '@bniddam-labs/api-core/core';

// Convertit automatiquement les strings en numbers
// GET /api/users?page=2&limit=20&search=john

const query = paginationQueryCoerceSchema.parse({
	page: '2',      // → 2 (number)
	limit: '20',    // → 20 (number)
	search: 'john',
});

// Valeurs par défaut
const defaults = paginationQueryCoerceSchema.parse({});
// { page: 1, limit: 10, sortOrder: 'DESC' }

// Limite maximale
const maxed = paginationQueryCoerceSchema.parse({
	page: '1',
	limit: '200', // → 100 (max)
});
```

### Paginated Result (Response)

```typescript
import {
	createPaginatedResultSchema,
	paginationMetaSchema,
	type PaginationMeta
} from '@bniddam-labs/api-core/core';
import { z } from 'zod';

const userSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email(),
});

// Créer un schéma de résultat paginé
const paginatedUsersSchema = createPaginatedResultSchema(userSchema);

type PaginatedUsers = z.infer<typeof paginatedUsersSchema>;

// Exemple de réponse
const response: PaginatedUsers = {
	data: [
		{
			id: '123e4567-e89b-12d3-a456-426614174000',
			name: 'John Doe',
			email: 'john@example.com',
		},
		{
			id: '550e8400-e29b-41d4-a716-446655440000',
			name: 'Jane Smith',
			email: 'jane@example.com',
		},
	],
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

### Calculer les Metadata de Pagination

```typescript
import { type PaginationMeta } from '@bniddam-labs/api-core/core';

function calculatePaginationMeta(
	page: number,
	limit: number,
	total: number,
): PaginationMeta {
	const totalPages = Math.ceil(total / limit);

	return {
		page,
		limit,
		total,
		totalPages,
		hasNextPage: page < totalPages,
		hasPreviousPage: page > 1,
	};
}

// Utilisation
const meta = calculatePaginationMeta(2, 10, 100);
// {
//   page: 2,
//   limit: 10,
//   total: 100,
//   totalPages: 10,
//   hasNextPage: true,
//   hasPreviousPage: true
// }
```

---

## Auth Schemas

Schémas pour l'authentification.

### Authenticated User

```typescript
import {
	authenticatedUserSchema,
	type AuthenticatedUser
} from '@bniddam-labs/api-core/core';

// Valider un utilisateur authentifié
const user: AuthenticatedUser = authenticatedUserSchema.parse({
	id: '123e4567-e89b-12d3-a456-426614174000',
	email: 'john@example.com',
});

// Email optionnel
const userWithoutEmail: AuthenticatedUser = {
	id: '123e4567-e89b-12d3-a456-426614174000',
};
```

### Avec NestJS Guards

```typescript
import { AuthenticatedUser } from '@bniddam-labs/api-core/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		// Valider et attacher l'utilisateur
		const user: AuthenticatedUser = {
			id: extractedUserId,
			email: extractedEmail,
		};

		request.user = user;
		return true;
	}
}

// Dans un controller
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@Request() req: { user: AuthenticatedUser }) {
	return this.service.findById(req.user.id);
}
```

### Avec Custom Decorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '@bniddam-labs/api-core/core';

export const CurrentUser = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
		const request = ctx.switchToHttp().getRequest();
		return request.user;
	},
);

// Utilisation
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: AuthenticatedUser) {
	return this.service.findById(user.id);
}
```

---

## NestJS Integration

### Swagger Decorators

```typescript
import {
	ApiSuccessResponse,
	ApiErrorResponse,
	ApiCommonResponses,
	ApiPaginatedResponse
} from '@bniddam-labs/api-core/nestjs';

// Réponse de succès
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

// Réponse unique
@Get(':id')
@ApiSuccessResponse({
	status: 200,
	description: 'Returns a user',
	type: UserDto,
})
async findOne(@Param('id') id: string) {
	return this.usersService.findOne(id);
}

// Erreurs spécifiques
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

// Erreurs communes (400, 401, 403, 404, 429, 500)
@Get(':id')
@ApiCommonResponses()
async findOne(@Param('id') id: string) {
	return this.usersService.findOne(id);
}

// Réponse paginée
@Get()
@ApiPaginatedResponse(UserDto, 'Returns paginated list of users')
async findAll(@Query() query: PaginationQueryDto) {
	return this.usersService.findAll(query);
}
```

### Complete Example: User CRUD

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import {
	ApiSuccessResponse,
	ApiErrorResponse,
	ApiCommonResponses,
	ApiPaginatedResponse
} from '@bniddam-labs/api-core/nestjs';
import {
	paginationQueryCoerceSchema,
	type PaginationQueryCoerce,
	type PaginatedResult,
	type AuthenticatedUser,
} from '@bniddam-labs/api-core/core';
import { createZodDto } from 'nestjs-zod';

// DTOs
class PaginationQueryDto extends createZodDto(paginationQueryCoerceSchema) {}

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	// Liste paginée
	@Get()
	@ApiPaginatedResponse(UserDto, 'Returns paginated list of users')
	@ApiCommonResponses()
	async findAll(
		@Query() query: PaginationQueryDto,
	): Promise<PaginatedResult<UserDto>> {
		return this.usersService.findAll(query);
	}

	// Un utilisateur
	@Get(':id')
	@ApiSuccessResponse({
		status: 200,
		description: 'Returns a user',
		type: UserDto,
	})
	@ApiErrorResponse(404, 'User not found')
	@ApiCommonResponses()
	async findOne(@Param('id') id: string): Promise<UserDto> {
		return this.usersService.findOne(id);
	}

	// Créer
	@Post()
	@ApiSuccessResponse({
		status: 201,
		description: 'User created',
		type: UserDto,
	})
	@ApiErrorResponse(400, 'Invalid request data')
	@ApiErrorResponse(409, 'Email already exists')
	@ApiCommonResponses()
	async create(@Body() dto: CreateUserDto): Promise<UserDto> {
		return this.usersService.create(dto);
	}

	// Modifier
	@Put(':id')
	@ApiSuccessResponse({
		status: 200,
		description: 'User updated',
		type: UserDto,
	})
	@ApiErrorResponse(400, 'Invalid request data')
	@ApiErrorResponse(404, 'User not found')
	@ApiCommonResponses()
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateUserDto,
	): Promise<UserDto> {
		return this.usersService.update(id, dto);
	}

	// Supprimer
	@Delete(':id')
	@ApiSuccessResponse({
		status: 204,
		description: 'User deleted',
	})
	@ApiErrorResponse(404, 'User not found')
	@ApiCommonResponses()
	async delete(@Param('id') id: string): Promise<void> {
		return this.usersService.delete(id);
	}
}
```

### Service with Pagination Helper

```typescript
import { Injectable } from '@nestjs/common';
import {
	type PaginationQueryCoerce,
	type PaginatedResult
} from '@bniddam-labs/api-core/core';

@Injectable()
export class UsersService {
	async findAll(query: PaginationQueryCoerce): Promise<PaginatedResult<User>> {
		const { page, limit, search, sortBy, sortOrder } = query;

		// Calculer offset
		const offset = (page - 1) * limit;

		// Query database
		const [users, total] = await this.repository.findAndCount({
			where: search ? { name: ILike(`%${search}%`) } : {},
			order: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'DESC' },
			skip: offset,
			take: limit,
		});

		// Calculer metadata
		const totalPages = Math.ceil(total / limit);

		return {
			data: users,
			meta: {
				page,
				limit,
				total,
				totalPages,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
		};
	}
}
```

---

## Type Inference Helpers

```typescript
import { type ApiResponse, type PaginatedResult } from '@bniddam-labs/api-core/core';
import { z } from 'zod';

// Inférer types depuis schémas
const userSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email(),
});

type User = z.infer<typeof userSchema>;

// Helper types
type UserResponse = ApiResponse<User>;
// { data: User, meta?: Record<string, unknown> }

type UsersResponse = ApiResponse<User[]>;
// { data: User[], meta?: Record<string, unknown> }

type PaginatedUsers = PaginatedResult<User>;
// { data: User[], meta: PaginationMeta }
```

---

## Best Practices

### 1. Toujours valider les inputs

```typescript
// ✅ Bon
const params = paginationQueryCoerceSchema.parse(req.query);

// ❌ Mauvais
const page = Number(req.query.page); // Pas de validation
```

### 2. Utiliser les types inférés

```typescript
// ✅ Bon
import { type PaginationQuery } from '@bniddam-labs/api-core/core';
const query: PaginationQuery = { page: 1, limit: 10 };

// ❌ Mauvais
const query = { page: 1, limit: 10 }; // Type implicite
```

### 3. Réutiliser les schémas

```typescript
// ✅ Bon
import { createApiResponseSchema } from '@bniddam-labs/api-core/core';
const userResponseSchema = createApiResponseSchema(userSchema);

// ❌ Mauvais
const userResponseSchema = z.object({
	data: userSchema,
	meta: z.record(z.unknown()).optional(),
}); // Duplication
```

### 4. Documenter avec Swagger

```typescript
// ✅ Bon
@ApiPaginatedResponse(UserDto, 'Returns paginated list of users')
@ApiCommonResponses()
async findAll() { }

// ❌ Mauvais
async findAll() { } // Pas de documentation
```

### 5. Gérer les erreurs de validation

```typescript
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

try {
	const data = schema.parse(input);
} catch (error) {
	if (error instanceof ZodError) {
		const validationError = fromZodError(error);
		throw new BadRequestException(validationError.message);
	}
	throw error;
}
```
