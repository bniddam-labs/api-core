# Interceptors Module

NestJS interceptors for request/response processing.

## Overview

This module provides interceptors that enhance your NestJS application with cross-cutting concerns like logging, monitoring, and request tracking.

## Exports

### `LoggingInterceptor`

HTTP request logging interceptor that provides comprehensive request/response logging.

**Features:**
- Logs incoming HTTP requests with details
- Tracks request duration (response time)
- Logs authenticated user information
- Captures response status codes
- Error tracking with stack traces
- IP address and user agent logging

**Logged Information:**

**Incoming Request:**
- HTTP method and URL
- Client IP address
- User ID (if authenticated, otherwise "anonymous")
- User agent string

**Completed Request:**
- HTTP status code
- Request duration in milliseconds
- User ID

**Failed Request:**
- Error status code
- Request duration
- Full error stack trace

**Usage:**

```typescript
import { NestFactory } from '@nestjs/core';
import { LoggingInterceptor } from '@bniddam-labs/api-core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply globally to all routes
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(3000);
}
bootstrap();
```

**Example Log Output:**

```
[LoggingInterceptor] Incoming Request: GET /api/users - IP: 192.168.1.100 - User: user-123 - UserAgent: Mozilla/5.0...
[LoggingInterceptor] Completed Request: GET /api/users - 200 - 45ms - User: user-123
```

```
[LoggingInterceptor] Incoming Request: POST /api/users - IP: 192.168.1.100 - User: anonymous - UserAgent: curl/7.64.1
[LoggingInterceptor] Failed Request: POST /api/users - 400 - 12ms - User: anonymous
Error: Validation error...
```

### `AuthenticatedRequest` Interface

Extended Request interface that includes user information.

```typescript
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
```

This interface is used by the `LoggingInterceptor` to access authenticated user data from the request object.

## Authentication Integration

The interceptor automatically detects authenticated users by checking for a `user` property on the request object. This property should be populated by your authentication guard/middleware.

**Example with JWT Guard:**

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '@bniddam-labs/api-core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Validate JWT and extract user info
    const user: AuthenticatedUser = {
      id: 'user-123',
      email: 'user@example.com',
      // ... other user properties
    };

    // Attach user to request - LoggingInterceptor will pick this up
    request.user = user;

    return true;
  }
}
```

## Performance Monitoring

The interceptor measures request duration, making it useful for:
- Performance monitoring
- Identifying slow endpoints
- Debugging production issues
- API analytics

## Use Cases

1. **Development**: Debug request/response flow
2. **Production**: Monitor API health and performance
3. **Security**: Track user actions and failed requests
4. **Analytics**: Gather request statistics

## Best Practices

1. **Apply globally**: Use as a global interceptor for complete coverage
2. **Combine with authentication**: Ensure user context is available
3. **Monitor logs**: Use log aggregation tools in production
4. **Performance**: Minimal overhead, safe for production use

## Related Modules

- [Filters](../filters/README.md) - Error handling and logging
- [Schemas](../schemas/README.md) - `AuthenticatedUser` type definition
- [Types](../types/README.md) - TypeScript types for authenticated users
