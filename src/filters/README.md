# Filters Module

NestJS exception filters for consistent error handling and response formatting.

## Overview

This module provides global exception filters that catch errors throughout your NestJS application and format them into consistent, standardized error responses. The filters handle both known HTTP exceptions and unexpected errors with proper logging and security considerations.

## Exports

### `AllExceptionsFilter`

Global exception filter that catches **all uncaught exceptions** (both HTTP and non-HTTP).

**Features:**
- Catches any unhandled exception in your application
- Provides consistent error response formatting
- Full stack trace logging for debugging
- Security-aware error messages (hides details in production)

**Usage:**

```typescript
import { NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from '@bniddam-labs/api-core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply globally
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
}
bootstrap();
```

**Error Response Format:**

```typescript
{
  statusCode: number;        // HTTP status code
  error: string;             // Error name (e.g., "Bad Request")
  message: string | string[]; // Error message(s)
  timestamp: string;         // ISO timestamp
  path: string;              // Request path
  method: string;            // HTTP method
}
```

**Production Behavior:**
- For unknown errors: returns `"Internal server error"` message
- Hides sensitive error details and stack traces
- Logs full error details server-side

### `HttpExceptionFilter`

Exception filter specifically for `HttpException` instances with enhanced logging.

**Features:**
- Targeted handling of NestJS HTTP exceptions
- Different log levels based on status code (warn for 4xx, error for 5xx)
- Security-aware sanitization for 500+ errors in production

**Usage:**

```typescript
import { NestFactory } from '@nestjs/core';
import { HttpExceptionFilter } from '@bniddam-labs/api-core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply globally
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
```

**Logging Behavior:**
- **4xx errors**: Logged as warnings with request details
- **5xx errors**: Logged as errors with full stack trace
- **Production 5xx**: Sanitized to prevent information leakage

## Error Response Schema

Both filters conform to the `ErrorResponse` type from the [schemas module](../schemas/README.md):

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  method: string;
}
```

## Best Practices

1. **Use AllExceptionsFilter globally**: Catches everything including unexpected errors
2. **Apply early in bootstrap**: Register filters before starting the application
3. **Combine with validation**: Works seamlessly with Zod validation errors
4. **Environment awareness**: Ensure `NODE_ENV=production` is set in production

## Example: Complete Setup

```typescript
import { NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from '@bniddam-labs/api-core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter for all errors
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
}
bootstrap();
```

## Filter Comparison

| Filter | Catches | Use Case |
|--------|---------|----------|
| `AllExceptionsFilter` | All exceptions | Recommended for most applications |
| `HttpExceptionFilter` | Only `HttpException` | When you want specialized HTTP error handling |

## Related Modules

- [Schemas](../schemas/README.md) - `ErrorResponse` schema and types
- [Pipes](../pipes/README.md) - Validation errors handled by these filters
- [Decorators](../decorators/README.md) - Zod decorators that throw validation exceptions
