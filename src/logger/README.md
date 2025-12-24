# Logger Module

Winston-based logging module for consistent logging across your application and consuming projects.

## Features

- **Winston-powered**: Built on the industry-standard Winston logging library
- **Context-aware**: Add context to all log entries for better tracing
- **Flexible API**: Compatible with NestJS Logger and ConsoleLogger APIs
- **Environment-aware**: Pretty console output for development
- **Framework-agnostic**: Can be used in any Node.js project
- **Multiple log levels**: `log`, `error`, `warn`, `debug`, `verbose`

## Installation

The logger is included with `@bniddam-labs/api-core`:

```bash
npm install @bniddam-labs/api-core
```

## Basic Usage

```typescript
import { Logger } from '@bniddam-labs/api-core';

// Create logger with context
const logger = new Logger('MyService');

// Log messages
logger.log('User registered successfully');
logger.warn('Cache miss, fetching from database');
logger.error('Database connection failed', error.stack);
logger.debug('Request payload:', payload);
logger.verbose('Detailed trace information');
```

## Usage in NestJS

The logger integrates seamlessly with NestJS services and controllers:

```typescript
import { Injectable } from '@nestjs/common';
import { Logger } from '@bniddam-labs/api-core';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  async createUser(dto: CreateUserDto) {
    this.logger.log(`Creating user: ${dto.email}`);

    try {
      const user = await this.repository.save(dto);
      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error.stack);
      throw error;
    }
  }
}
```

## API Reference

### Constructor

```typescript
new Logger(context?: string)
```

**Parameters:**
- `context` (optional): A label to identify the source of logs (e.g., service name, class name)

**Example:**
```typescript
const logger = new Logger('AuthController');
```

### Methods

#### `log(message: string, ...optionalParams: unknown[]): void`

Log an informational message.

```typescript
logger.log('Server started on port 3000');
logger.log('Processing request', { userId: 123, action: 'login' });
```

#### `error(message: string, stackOrContext?: string | unknown, context?: string): void`

Log an error message with optional stack trace.

```typescript
// With stack trace
logger.error('Database error', error.stack);

// With metadata
logger.error('Validation failed', { field: 'email', value: 'invalid' });

// With custom context
logger.error('Auth error', error.stack, 'AuthService');
```

#### `warn(message: string, ...optionalParams: unknown[]): void`

Log a warning message.

```typescript
logger.warn('API rate limit approaching');
logger.warn('Deprecated method used', { method: 'oldMethod' });
```

#### `debug(message: string, ...optionalParams: unknown[]): void`

Log a debug message (useful for development).

```typescript
logger.debug('Cache hit', { key: 'user:123', ttl: 3600 });
```

#### `verbose(message: string, ...optionalParams: unknown[]): void`

Log verbose/detailed information.

```typescript
logger.verbose('SQL Query executed', { query, duration: 45 });
```

## Configuration

The logger respects environment variables for configuration:

### Log Level

Control the minimum log level via `LOG_LEVEL` environment variable:

```bash
# Production: only errors and warnings
LOG_LEVEL=warn

# Development: all logs including debug
LOG_LEVEL=debug

# Default: info
LOG_LEVEL=info
```

**Available levels** (from highest to lowest priority):
- `error` - Only error messages
- `warn` - Warnings and errors
- `info` - Informational, warnings, and errors (default)
- `debug` - Debug, info, warnings, and errors
- `verbose` - All messages including verbose

## Output Format

### Console Output

The logger outputs colorized, human-readable logs to the console:

```
2025-01-26 10:30:45 info [UsersService] User created successfully
2025-01-26 10:31:12 warn [CacheService] Cache miss for key: user:123
2025-01-26 10:32:05 error [DatabaseService] Connection timeout
Error: ETIMEDOUT
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1144:16)
```

**Format:**
```
<timestamp> <level> [<context>] <message>
<stack trace if present>
```

## Advanced Usage

### Using in Filters and Interceptors

The logger is already integrated into the built-in filters and interceptors:

```typescript
// src/filters/http-exception.filter.ts
import { Logger } from '../logger/index.js';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost): void {
    this.logger.error(`HTTP ${status} Error: ${method} ${url}`, exception.stack);
    // ... handle exception
  }
}
```

### Structured Logging

Pass objects for structured logging:

```typescript
logger.log('User action', {
  userId: '123',
  action: 'purchase',
  amount: 99.99,
  currency: 'USD',
  timestamp: new Date().toISOString()
});
```

### Error Logging with Context

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error(
    'Operation failed',
    error instanceof Error ? error.stack : String(error)
  );
}
```

## Migration from ConsoleLogger

If you're migrating from `@bniddam-labs/core` ConsoleLogger:

```typescript
// Before
import { ConsoleLogger } from '@bniddam-labs/core';
const logger = new ConsoleLogger('MyService');

// After
import { Logger } from '@bniddam-labs/api-core';
const logger = new Logger('MyService');

// API remains the same!
logger.log('Message');
logger.error('Error', stack);
logger.warn('Warning');
```

The API is fully compatible, so no code changes are needed.

## Best Practices

### 1. Use Descriptive Contexts

```typescript
// Good
const logger = new Logger('UserRegistrationService');

// Less helpful
const logger = new Logger('Service');
```

### 2. Log Meaningful Information

```typescript
// Good - actionable information
logger.error('Failed to send email', {
  recipient: user.email,
  templateId: 'welcome',
  error: error.message
});

// Poor - not helpful
logger.error('Error occurred');
```

### 3. Use Appropriate Log Levels

```typescript
// Error - something went wrong
logger.error('Payment processing failed', error.stack);

// Warn - potential issue, but recoverable
logger.warn('Cache unavailable, falling back to database');

// Info - normal business operations
logger.log('User logged in successfully');

// Debug - development/troubleshooting
logger.debug('Request payload validation passed', { payload });

// Verbose - detailed tracing
logger.verbose('Database query executed', { sql, duration });
```

### 4. Include Context in Errors

```typescript
logger.error('Database query failed', error.stack, {
  query: sql,
  params: values,
  userId: currentUser.id
});
```

### 5. Don't Log Sensitive Information

```typescript
// Bad - logs password
logger.log('User login attempt', { email, password });

// Good - no sensitive data
logger.log('User login attempt', { email });
```

## Examples

### Complete Service Example

```typescript
import { Injectable } from '@nestjs/common';
import { Logger } from '@bniddam-labs/api-core';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger('PaymentService');

  async processPayment(orderId: string, amount: number) {
    this.logger.log(`Processing payment for order ${orderId}`);

    try {
      // Validate
      this.logger.debug('Validating payment details', { orderId, amount });
      await this.validate(orderId, amount);

      // Process
      const result = await this.gateway.charge(amount);
      this.logger.log(`Payment successful: ${result.transactionId}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Payment failed for order ${orderId}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }
}
```

### Controller Example

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { Logger, ZodBody } from '@bniddam-labs/api-core';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger('OrdersController');

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@ZodBody(createOrderSchema) dto: CreateOrderDto) {
    this.logger.log('Creating new order', { items: dto.items.length });

    try {
      const order = await this.ordersService.create(dto);
      this.logger.log(`Order created: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.warn('Order creation failed', {
        reason: error.message,
        itemCount: dto.items.length
      });
      throw error;
    }
  }
}
```

## Troubleshooting

### Logs not appearing

Check your `LOG_LEVEL` environment variable:

```bash
# See all logs including debug
export LOG_LEVEL=debug
```

### Too many logs in production

Set a higher log level:

```bash
# Only warnings and errors
export LOG_LEVEL=warn
```

## Related Modules

- **[Filters](../filters/README.md)** - Exception filters that use this logger
- **[Interceptors](../interceptors/README.md)** - Request interceptors that use this logger
- **[Pipes](../pipes/README.md)** - Validation pipes that use NestJS Logger

## Technical Details

- Built on [Winston](https://github.com/winstonjs/winston) v3.x
- Colorized console output using winston's built-in colorizer
- Timestamps formatted as `YYYY-MM-DD HH:mm:ss`
- Stack traces preserved and formatted for readability
- Metadata objects automatically structured in logs
