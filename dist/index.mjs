import { z } from 'zod';
import { Injectable, Catch, HttpException, BadRequestException, Body, Param, Query, HttpStatus, applyDecorators } from '@nestjs/common';
import { fromError } from 'zod-validation-error';
import { ConsoleLogger } from '@bniddam-labs/core';
import { tap } from 'rxjs/operators';
import { ApiResponse, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (decorator(result)) || result;
  return result;
};
var uuidSchema = z.string().uuid("Invalid UUID format");
var uuidV4Schema = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  "Invalid UUID v4 format"
);
var optionalUuidSchema = uuidSchema.optional().nullable();
var uuidArraySchema = z.array(uuidSchema);
var slugSchema = z.string().regex(
  /^[a-z0-9]+(-[a-z0-9]+)*$/,
  "Invalid slug format (must be lowercase alphanumeric with hyphens)"
);
var optionalSlugSchema = slugSchema.optional().nullable();
var idParamSchema = z.object({
  id: uuidSchema
});
var slugParamSchema = z.object({
  slug: slugSchema
});
var apiResponseMetaSchema = z.record(z.string(), z.unknown());
var createApiResponseSchema = (dataSchema) => z.object({
  data: dataSchema,
  meta: apiResponseMetaSchema.optional()
});
var errorResponseSchema = z.object({
  /** HTTP status code */
  statusCode: z.number().int().min(100).max(599),
  /** Error message (string or array of strings for validation errors) */
  message: z.union([z.string(), z.array(z.string())]),
  /** Error type/name */
  error: z.string(),
  /** ISO timestamp when the error occurred */
  timestamp: z.string().optional(),
  /** Request path that caused the error */
  path: z.string().optional(),
  /** HTTP method used */
  method: z.string().optional()
});
var paginationParamsSchema = z.object({
  /** Page number (1-indexed) */
  page: z.number().int().positive(),
  /** Items per page */
  limit: z.number().int().positive()
});
var offsetPaginationSchema = z.object({
  /** Number of items to skip */
  offset: z.number().int().nonnegative(),
  /** Number of items to take */
  limit: z.number().int().positive()
});
var paginationMetaSchema = z.object({
  /** Current page number */
  page: z.number().int().positive(),
  /** Items per page */
  limit: z.number().int().positive(),
  /** Total number of items across all pages */
  total: z.number().int().nonnegative(),
  /** Total number of pages */
  totalPages: z.number().int().nonnegative(),
  /** Whether there is a next page */
  hasNextPage: z.boolean(),
  /** Whether there is a previous page */
  hasPreviousPage: z.boolean()
});
var createPaginatedResultSchema = (dataSchema) => z.object({
  /** Array of data items */
  data: z.array(dataSchema),
  /** Pagination metadata */
  meta: paginationMetaSchema
});
var MAX_ITEMS_PER_PAGE = 100;
var paginationQuerySchema = paginationParamsSchema.extend({
  /** Items per page (max 100) */
  limit: z.number().int().positive().max(MAX_ITEMS_PER_PAGE)
}).extend({
  /** Search term to filter results */
  search: z.string().trim().optional(),
  /** Field to sort by */
  sortBy: z.string().optional(),
  /** Sort direction */
  sortOrder: z.enum(["ASC", "DESC"]).optional().default("DESC")
});
var paginationQueryCoerceSchema = z.object({
  /** Page number (coerced from string, defaults to 1) */
  page: z.coerce.number().int().positive().default(1),
  /** Items per page (coerced from string, max 100, defaults to 10) */
  limit: z.coerce.number().int().positive().max(MAX_ITEMS_PER_PAGE).default(10),
  /** Search term */
  search: z.string().trim().optional(),
  /** Field to sort by */
  sortBy: z.string().optional(),
  /** Sort direction */
  sortOrder: z.enum(["ASC", "DESC"]).optional().default("DESC")
});
var authenticatedUserSchema = z.object({
  /** User unique identifier (UUID) */
  id: uuidSchema,
  /** User email address */
  email: z.string().email().optional()
});

// src/helpers/id.helpers.ts
function isValidUuid(value) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}
function isValidUuidV4(value) {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(value);
}
function extractUuids(text) {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
  return text.match(uuidRegex) || [];
}

// src/helpers/pagination.helpers.ts
function toOffsetPagination(params) {
  const { page, limit } = params;
  return {
    offset: (page - 1) * limit,
    limit
  };
}
function calculatePaginationMeta(params, total) {
  const { page, limit } = params;
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}
function createPaginatedResult(data, params, total) {
  return {
    data,
    meta: calculatePaginationMeta(params, total)
  };
}
function normalizePagination(page = 1, limit = 10, maxLimit = MAX_ITEMS_PER_PAGE) {
  return {
    page: Math.max(1, Math.floor(page)),
    limit: Math.min(maxLimit, Math.max(1, Math.floor(limit)))
  };
}

// src/helpers/slug.helpers.ts
function slugify(value, fallback = "slug") {
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
  return normalized.length > 0 ? normalized : fallback;
}
function generateUniqueSlug(value, existingSlugs, fallback) {
  const baseSlug = slugify(value, fallback);
  let slug = baseSlug;
  let attempt = 1;
  const slugSet = new Set(existingSlugs);
  while (slugSet.has(slug)) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
  return slug;
}
function isValidSlug(value) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}
var ZodValidationPipe = class {
  /**
   * @param schema - Zod schema to validate against
   * @param schemaName - Optional name of the schema for better logging (e.g., 'loginSchema', 'registerUserSchema')
   */
  constructor(schema, schemaName) {
    this.schema = schema;
    this.schemaName = schemaName;
  }
  logger = new ConsoleLogger("ZodValidationPipe");
  transform(value, _metadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      const isDevelopment = process.env.NODE_ENV === "development";
      if (isDevelopment && this.isZodError(error)) {
        this.logZodValidationError(error, value);
      }
      const validationError = fromError(error);
      let detailedErrors = [];
      if (error && typeof error === "object" && "issues" in error) {
        detailedErrors = error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }));
      }
      throw new BadRequestException({
        message: "Validation failed",
        error: validationError.toString(),
        errors: detailedErrors,
        statusCode: 400
      });
    }
  }
  /**
   * Type guard to check if error is a ZodError
   */
  isZodError(error) {
    return error !== null && typeof error === "object" && "issues" in error && Array.isArray(error.issues);
  }
  /**
   * Log detailed Zod validation errors in development mode
   * This provides comprehensive error information without affecting the HTTP response
   */
  logZodValidationError(error, rawData) {
    const schemaInfo = this.schemaName ? `Schema: ${this.schemaName}` : "Schema: <unnamed>";
    const separator = "\u2500".repeat(80);
    const errorLines = ["", separator, "\u274C [ZOD VALIDATION ERROR]", schemaInfo, "", "Issues:"];
    for (const issue of error.issues) {
      const path = issue.path.length > 0 ? issue.path.join(".") : "<root>";
      const received = "received" in issue ? ` (received: ${JSON.stringify(issue.received)})` : "";
      const expected = "expected" in issue ? ` (expected: ${issue.expected})` : "";
      errorLines.push(`  \u2022 ${path}: ${issue.message}${expected}${received}`);
      if (issue.code === "invalid_type") {
        errorLines.push(`    \u2514\u2500 Type mismatch detected`);
      } else if (issue.code === "invalid_string" && "validation" in issue) {
        errorLines.push(`    \u2514\u2500 Validation type: ${issue.validation}`);
      } else if (issue.code === "too_small" || issue.code === "too_big") {
        errorLines.push(`    \u2514\u2500 Constraint violation`);
      }
    }
    errorLines.push("");
    errorLines.push("Raw data received:");
    const rawDataString = JSON.stringify(rawData, null, 2);
    if (rawDataString.length > 1e3) {
      errorLines.push(`${rawDataString.substring(0, 1e3)}... [truncated, total size: ${rawDataString.length} chars]`);
    } else {
      errorLines.push(rawDataString);
    }
    errorLines.push(separator);
    errorLines.push("");
    this.logger.error(errorLines.join("\n"));
  }
};
ZodValidationPipe = __decorateClass([
  Injectable()
], ZodValidationPipe);

// src/decorators/zod-body.decorator.ts
function ZodBody(schema, schemaName) {
  return Body(new ZodValidationPipe(schema, schemaName));
}
function ZodParam(schema, schemaName) {
  return Param(new ZodValidationPipe(schema, schemaName));
}
function ZodQuery(schema, schemaName) {
  return Query(new ZodValidationPipe(schema, schemaName));
}
var AllExceptionsFilter = class {
  logger = new ConsoleLogger("AllExceptionsFilter");
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        const responseObj = exceptionResponse;
        if (responseObj.message) {
          message = responseObj.message;
        }
      }
    }
    this.logger.error(`Unhandled exception: ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : String(exception));
    const errorResponse = {
      statusCode: status,
      error: this.getErrorName(status),
      message: process.env.NODE_ENV === "production" ? "Internal server error" : message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      path: request.url,
      method: request.method
    };
    response.status(status).json(errorResponse);
  }
  /**
   * Get standard HTTP error name from status code
   */
  getErrorName(status) {
    const errorNames = {
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      409: "Conflict",
      422: "Unprocessable Entity",
      429: "Too Many Requests",
      500: "Internal Server Error",
      502: "Bad Gateway",
      503: "Service Unavailable"
    };
    return errorNames[status] || "Error";
  }
};
AllExceptionsFilter = __decorateClass([
  Catch()
], AllExceptionsFilter);
var HttpExceptionFilter = class {
  logger = new ConsoleLogger("HttpExceptionFilter");
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    let message = "Internal server error";
    let error = this.getErrorName(status);
    if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
      const responseObj = exceptionResponse;
      if (responseObj.message) {
        message = responseObj.message;
      }
      if (responseObj.error && typeof responseObj.error === "string") {
        error = responseObj.error;
      }
    } else if (typeof exceptionResponse === "string") {
      message = exceptionResponse;
    }
    const errorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      path: request.url,
      method: request.method
    };
    if (status >= 500) {
      this.logger.error(`HTTP ${status} Error: ${request.method} ${request.url}`, exception.stack);
    } else {
      this.logger.warn(
        `HTTP ${status} Error: ${request.method} ${request.url} - ${Array.isArray(errorResponse.message) ? errorResponse.message.join(", ") : errorResponse.message}`
      );
    }
    if (process.env.NODE_ENV === "production" && status >= 500) {
      errorResponse.message = "Internal server error";
      errorResponse.error = "Internal Server Error";
    }
    response.status(status).json(errorResponse);
  }
  /**
   * Get standard HTTP error name from status code
   */
  getErrorName(status) {
    const errorNames = {
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      409: "Conflict",
      422: "Unprocessable Entity",
      429: "Too Many Requests",
      500: "Internal Server Error",
      502: "Bad Gateway",
      503: "Service Unavailable"
    };
    return errorNames[status] || "Error";
  }
};
HttpExceptionFilter = __decorateClass([
  Catch(HttpException)
], HttpExceptionFilter);
var LoggingInterceptor = class {
  logger = new ConsoleLogger("LoggingInterceptor");
  intercept(context, next) {
    if (context.getType() !== "http") {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip } = request;
    const userAgent = request.get("User-Agent") ?? "";
    const startTime = Date.now();
    const user = request.user;
    const userId = user?.id ?? "anonymous";
    this.logger.log(`Incoming Request: ${method} ${url} - IP: ${ip} - User: ${userId} - UserAgent: ${userAgent}`);
    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;
          this.logger.log(`Completed Request: ${method} ${url} - ${statusCode} - ${duration}ms - User: ${userId}`);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status ?? error.statusCode ?? 500;
          this.logger.error(`Failed Request: ${method} ${url} - ${statusCode} - ${duration}ms - User: ${userId}`, error.stack);
        }
      })
    );
  }
};
LoggingInterceptor = __decorateClass([
  Injectable()
], LoggingInterceptor);
var apiResponseDecoratorOptionsSchema = z.object({
  /** HTTP status code */
  status: z.number().int().min(100).max(599),
  /** Response description */
  description: z.string(),
  /** Response type/DTO class */
  type: z.custom().optional(),
  /** Whether the response is an array */
  isArray: z.boolean().optional().default(false)
});
function ApiSuccessResponse(options) {
  const decorators = [
    ApiResponse({
      status: options.status,
      description: options.description,
      type: options.type,
      isArray: options.isArray
    })
  ];
  return applyDecorators(...decorators);
}
var errorResponseJsonSchema = {
  type: "object",
  required: ["statusCode", "message", "error"],
  properties: {
    statusCode: { type: "integer", minimum: 100, maximum: 599 },
    message: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] },
    error: { type: "string" },
    timestamp: { type: "string" },
    path: { type: "string" },
    method: { type: "string" }
  }
};
function ApiErrorResponse(status, description) {
  return ApiResponse({
    status,
    description,
    schema: {
      ...errorResponseJsonSchema,
      example: {
        statusCode: status,
        message: description,
        error: getErrorName(status),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        path: "/api/resource",
        method: "GET"
      }
    }
  });
}
function getErrorName(status) {
  const errorNames = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable"
  };
  return errorNames[status] || "Error";
}
function ApiCommonResponses() {
  return applyDecorators(
    ApiErrorResponse(400, "Bad Request - Validation failed"),
    ApiErrorResponse(401, "Unauthorized - Authentication required"),
    ApiErrorResponse(403, "Forbidden - Insufficient permissions"),
    ApiErrorResponse(404, "Not Found - Resource not found"),
    ApiErrorResponse(429, "Too Many Requests - Rate limit exceeded"),
    ApiErrorResponse(500, "Internal Server Error")
  );
}
function ApiPaginatedResponse(dataType, description) {
  return ApiResponse({
    status: 200,
    description,
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: `#/components/schemas/${dataType.name}` }
        },
        meta: {
          type: "object",
          properties: {
            page: { type: "number", example: 1 },
            limit: { type: "number", example: 10 },
            total: { type: "number", example: 100 },
            totalPages: { type: "number", example: 10 },
            hasNextPage: { type: "boolean", example: true },
            hasPreviousPage: { type: "boolean", example: false }
          }
        }
      }
    }
  });
}
var swaggerUiOptionsSchema = z.object({
  /** Persist authorization data in browser @default true */
  persistAuthorization: z.boolean().optional(),
  /** Display request duration in responses @default true */
  displayRequestDuration: z.boolean().optional(),
  /** Sort tags alphabetically @default 'alpha' */
  tagsSorter: z.union([z.literal("alpha"), z.function()]).optional(),
  /** Sort operations alphabetically @default 'alpha' */
  operationsSorter: z.union([z.literal("alpha"), z.literal("method"), z.function()]).optional()
});
var swaggerSetupOptionsSchema = z.object({
  /** API title shown in Swagger UI @default 'API Documentation' */
  title: z.string().optional(),
  /** API description @default 'REST API documentation' */
  description: z.string().optional(),
  /** API version @default '1.0' */
  version: z.string().optional(),
  /** Path where Swagger UI will be available @default 'api' */
  path: z.string().optional(),
  /** Whether to add Bearer authentication support @default true */
  addBearerAuth: z.boolean().optional(),
  /** Custom Swagger UI options */
  swaggerUiOptions: swaggerUiOptionsSchema.optional()
});
function setupSwagger(app, options) {
  const { title = "API Documentation", description = "REST API documentation", version = "1.0", path = "api", addBearerAuth = true, swaggerUiOptions = {} } = options || {};
  let configBuilder = new DocumentBuilder().setTitle(title).setDescription(description).setVersion(version);
  if (addBearerAuth) {
    configBuilder = configBuilder.addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token"
      },
      "bearer"
      // This is the security scheme name
    );
  }
  const config = configBuilder.build();
  const document = SwaggerModule.createDocument(app, config);
  const defaultSwaggerUiOptions = {
    persistAuthorization: true,
    displayRequestDuration: true,
    tagsSorter: "alpha",
    operationsSorter: "alpha"
  };
  SwaggerModule.setup(path, app, document, {
    swaggerOptions: {
      ...defaultSwaggerUiOptions,
      ...swaggerUiOptions
    }
  });
}

export { AllExceptionsFilter, ApiCommonResponses, ApiErrorResponse, ApiPaginatedResponse, ApiSuccessResponse, HttpExceptionFilter, LoggingInterceptor, MAX_ITEMS_PER_PAGE, ZodBody, ZodParam, ZodQuery, ZodValidationPipe, apiResponseDecoratorOptionsSchema, apiResponseMetaSchema, authenticatedUserSchema, calculatePaginationMeta, createApiResponseSchema, createPaginatedResult, createPaginatedResultSchema, errorResponseSchema, extractUuids, generateUniqueSlug, idParamSchema, isValidSlug, isValidUuid, isValidUuidV4, normalizePagination, offsetPaginationSchema, optionalSlugSchema, optionalUuidSchema, paginationMetaSchema, paginationParamsSchema, paginationQueryCoerceSchema, paginationQuerySchema, setupSwagger, slugParamSchema, slugSchema, slugify, swaggerSetupOptionsSchema, swaggerUiOptionsSchema, toOffsetPagination, uuidArraySchema, uuidSchema, uuidV4Schema };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map