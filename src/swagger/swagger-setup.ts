import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configuration options for Swagger/OpenAPI setup
 */
export interface SwaggerSetupOptions {
  /**
   * API title shown in Swagger UI
   * @default 'API Documentation'
   */
  title?: string;

  /**
   * API description
   * @default 'REST API documentation'
   */
  description?: string;

  /**
   * API version
   * @default '1.0'
   */
  version?: string;

  /**
   * Path where Swagger UI will be available
   * @default 'api'
   */
  path?: string;

  /**
   * Whether to add Bearer authentication support
   * @default true
   */
  addBearerAuth?: boolean;

  /**
   * Custom Swagger UI options
   */
  swaggerUiOptions?: {
    /**
     * Persist authorization data in browser
     * @default true
     */
    persistAuthorization?: boolean;

    /**
     * Display request duration in responses
     * @default true
     */
    displayRequestDuration?: boolean;

    /**
     * Sort tags alphabetically
     * @default 'alpha'
     */
    tagsSorter?: 'alpha' | ((a: string, b: string) => number);

    /**
     * Sort operations alphabetically
     * @default 'alpha'
     */
    operationsSorter?: 'alpha' | 'method' | ((a: any, b: any) => number);
  };
}

/**
 * Sets up Swagger/OpenAPI documentation for a NestJS application
 *
 * Creates and configures Swagger UI with sensible defaults while allowing customization.
 * Automatically adds Bearer JWT authentication if enabled.
 *
 * @param app - The NestJS application instance
 * @param options - Configuration options for Swagger setup
 *
 * @example
 * ```typescript
 * import { setupSwagger } from '@saas/api-core';
 *
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 *
 *   // Basic setup with defaults
 *   setupSwagger(app);
 *
 *   // Custom setup
 *   setupSwagger(app, {
 *     title: 'My API',
 *     description: 'API for my application',
 *     version: '2.0',
 *     path: 'docs',
 *   });
 *
 *   await app.listen(3000);
 * }
 * ```
 */
export function setupSwagger(app: INestApplication, options?: SwaggerSetupOptions): void {
  const {
    title = 'API Documentation',
    description = 'REST API documentation',
    version = '1.0',
    path = 'api',
    addBearerAuth = true,
    swaggerUiOptions = {},
  } = options || {};

  // Build Swagger configuration
  let configBuilder = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version);

  // Add Bearer JWT authentication if enabled
  if (addBearerAuth) {
    configBuilder = configBuilder.addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
      'bearer', // This is the security scheme name
    );
  }

  const config = configBuilder.build();

  // Create Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI with custom options
  const defaultSwaggerUiOptions = {
    persistAuthorization: true,
    displayRequestDuration: true,
    tagsSorter: 'alpha' as const,
    operationsSorter: 'alpha' as const,
  };

  SwaggerModule.setup(path, app, document, {
    swaggerOptions: {
      ...defaultSwaggerUiOptions,
      ...swaggerUiOptions,
    },
  });
}
