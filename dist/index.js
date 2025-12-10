'use strict';

var zod = require('zod');
var common = require('@nestjs/common');
var core = require('@bniddam-labs/core');
var operators = require('rxjs/operators');
var swagger = require('@nestjs/swagger');

var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (decorator(result)) || result;
  return result;
};
var uuidSchema = zod.z.string().uuid("Invalid UUID format");
var uuidV4Schema = zod.z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  "Invalid UUID v4 format"
);
var optionalUuidSchema = uuidSchema.optional().nullable();
var uuidArraySchema = zod.z.array(uuidSchema);
var slugSchema = zod.z.string().regex(
  /^[a-z0-9]+(-[a-z0-9]+)*$/,
  "Invalid slug format (must be lowercase alphanumeric with hyphens)"
);
var optionalSlugSchema = slugSchema.optional().nullable();
var idParamSchema = zod.z.object({
  id: uuidSchema
});
var slugParamSchema = zod.z.object({
  slug: slugSchema
});
var apiResponseMetaSchema = zod.z.record(zod.z.string(), zod.z.unknown());
var createApiResponseSchema = (dataSchema) => zod.z.object({
  data: dataSchema,
  meta: apiResponseMetaSchema.optional()
});
var errorResponseSchema = zod.z.object({
  /** HTTP status code */
  statusCode: zod.z.number().int().min(100).max(599),
  /** Error message (string or array of strings for validation errors) */
  message: zod.z.union([zod.z.string(), zod.z.array(zod.z.string())]),
  /** Error type/name */
  error: zod.z.string(),
  /** ISO timestamp when the error occurred */
  timestamp: zod.z.string().optional(),
  /** Request path that caused the error */
  path: zod.z.string().optional(),
  /** HTTP method used */
  method: zod.z.string().optional()
});
var paginationParamsSchema = zod.z.object({
  /** Page number (1-indexed) */
  page: zod.z.number().int().positive(),
  /** Items per page */
  limit: zod.z.number().int().positive()
});
var offsetPaginationSchema = zod.z.object({
  /** Number of items to skip */
  offset: zod.z.number().int().nonnegative(),
  /** Number of items to take */
  limit: zod.z.number().int().positive()
});
var paginationMetaSchema = zod.z.object({
  /** Current page number */
  page: zod.z.number().int().positive(),
  /** Items per page */
  limit: zod.z.number().int().positive(),
  /** Total number of items across all pages */
  total: zod.z.number().int().nonnegative(),
  /** Total number of pages */
  totalPages: zod.z.number().int().nonnegative(),
  /** Whether there is a next page */
  hasNextPage: zod.z.boolean(),
  /** Whether there is a previous page */
  hasPreviousPage: zod.z.boolean()
});
var createPaginatedResultSchema = (dataSchema) => zod.z.object({
  /** Array of data items */
  data: zod.z.array(dataSchema),
  /** Pagination metadata */
  meta: paginationMetaSchema
});
var MAX_ITEMS_PER_PAGE = 100;
var paginationQuerySchema = paginationParamsSchema.extend({
  /** Items per page (max 100) */
  limit: zod.z.number().int().positive().max(MAX_ITEMS_PER_PAGE)
}).extend({
  /** Search term to filter results */
  search: zod.z.string().trim().optional(),
  /** Field to sort by */
  sortBy: zod.z.string().optional(),
  /** Sort direction */
  sortOrder: zod.z.enum(["ASC", "DESC"]).optional().default("DESC")
});
var paginationQueryCoerceSchema = zod.z.object({
  /** Page number (coerced from string, defaults to 1) */
  page: zod.z.coerce.number().int().positive().default(1),
  /** Items per page (coerced from string, max 100, defaults to 10) */
  limit: zod.z.coerce.number().int().positive().max(MAX_ITEMS_PER_PAGE).default(10),
  /** Search term */
  search: zod.z.string().trim().optional(),
  /** Field to sort by */
  sortBy: zod.z.string().optional(),
  /** Sort direction */
  sortOrder: zod.z.enum(["ASC", "DESC"]).optional().default("DESC")
});
var authenticatedUserSchema = zod.z.object({
  /** User unique identifier (UUID) */
  id: uuidSchema,
  /** User email address */
  email: zod.z.email().optional()
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
var isInvalidType = (issue) => issue.code === "invalid_type";
var isInvalidFormat = (issue) => issue.code === "invalid_format";
var isTooSmall = (issue) => issue.code === "too_small";
var isTooBig = (issue) => issue.code === "too_big";
var isNotMultipleOf = (issue) => issue.code === "not_multiple_of";
var isUnrecognizedKeys = (issue) => issue.code === "unrecognized_keys";
var isInvalidUnion = (issue) => issue.code === "invalid_union";
var isInvalidKey = (issue) => issue.code === "invalid_key";
var isInvalidElement = (issue) => issue.code === "invalid_element";
var isInvalidValue = (issue) => issue.code === "invalid_value";
var isCustomIssue = (issue) => issue.code === "custom";
function readInput(issue) {
  const candidate = issue;
  return candidate.input !== void 0 ? JSON.stringify(candidate.input) : "<no input>";
}
exports.ZodValidationPipe = class ZodValidationPipe {
  constructor(schema, schemaName) {
    this.schema = schema;
    this.schemaName = schemaName;
  }
  logger = new common.Logger(exports.ZodValidationPipe.name);
  transform(value, metadata) {
    try {
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof Error && err.issues) {
        this.logZodValidationError(err, value);
        throw new common.BadRequestException("Validation error");
      }
      throw err;
    }
  }
  /* -------------------------------------------------------
   * Log complet des erreurs Zod v4
   * ----------------------------------------------------- */
  logZodValidationError(error, rawData) {
    const schemaInfo = this.schemaName ? `Schema: ${this.schemaName}` : "Schema: <unnamed>";
    const separator = "\u2500".repeat(80);
    const lines = ["", separator, "\u274C [ZOD VALIDATION ERROR]", schemaInfo, "", "Issues:"];
    for (const issue of error.issues) {
      lines.push(...this.formatIssue(issue));
    }
    lines.push("");
    lines.push("Raw data received:");
    const rawString = JSON.stringify(rawData, null, 2);
    if (rawString.length > 3e3) {
      lines.push(rawString.slice(0, 3e3) + "... [truncated]");
    } else {
      lines.push(rawString);
    }
    lines.push(separator);
    lines.push("");
    this.logger.error(lines.join("\n"));
  }
  /* -------------------------------------------------------
   * Formatage exhaustif des issues Zod v4
   * ----------------------------------------------------- */
  formatIssue(issue) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "<root>";
    const out = [`  \u2022 ${path}: ${issue.message}`];
    const inputStr = readInput(issue);
    if (isInvalidType(issue)) {
      out.push(`    \u2514\u2500 Expected: ${issue.expected}`);
      out.push(`    \u2514\u2500 Input: ${inputStr}`);
      return out;
    }
    if (isInvalidFormat(issue)) {
      out.push(`    \u2514\u2500 Format: ${issue.format}`);
      if ("pattern" in issue && issue.pattern) {
        out.push(`    \u2514\u2500 Pattern: ${issue.pattern}`);
      }
      out.push(`    \u2514\u2500 Input: ${inputStr}`);
      return out;
    }
    if (isTooSmall(issue)) {
      out.push(`    \u2514\u2500 Minimum: ${issue.minimum}`);
      out.push(`    \u2514\u2500 Inclusive: ${issue.inclusive ?? false}`);
      if (issue.exact) out.push(`    \u2514\u2500 Exact value required`);
      out.push(`    \u2514\u2500 Input: ${inputStr}`);
      return out;
    }
    if (isTooBig(issue)) {
      out.push(`    \u2514\u2500 Maximum: ${issue.maximum}`);
      out.push(`    \u2514\u2500 Inclusive: ${issue.inclusive ?? false}`);
      if (issue.exact) out.push(`    \u2514\u2500 Exact value required`);
      out.push(`    \u2514\u2500 Input: ${inputStr}`);
      return out;
    }
    if (isNotMultipleOf(issue)) {
      out.push(`    \u2514\u2500 Divisor: ${issue.divisor}`);
      out.push(`    \u2514\u2500 Input: ${inputStr}`);
      return out;
    }
    if (isUnrecognizedKeys(issue)) {
      out.push(`    \u2514\u2500 Unrecognized keys: ${issue.keys.join(", ")}`);
      return out;
    }
    if (isInvalidUnion(issue)) {
      out.push(`    \u2514\u2500 Invalid union`);
      if (issue.discriminator) {
        out.push(`    \u2514\u2500 Discriminator: ${issue.discriminator}`);
      }
      out.push(`    \u2514\u2500 Input: ${inputStr}`);
      return out;
    }
    if (isInvalidKey(issue)) {
      out.push(`    \u2514\u2500 Invalid map/record key`);
      out.push(`    \u2514\u2500 Input: ${inputStr}`);
      return out;
    }
    if (isInvalidElement(issue)) {
      out.push(`    \u2514\u2500 Invalid element in map/set`);
      out.push(`    \u2514\u2500 Input: ${inputStr}`);
      return out;
    }
    if (isInvalidValue(issue)) {
      out.push(`    \u2514\u2500 Invalid value: ${issue.values.join(", ")}`);
      out.push(`    \u2514\u2500 Input: ${inputStr}`);
      return out;
    }
    if (isCustomIssue(issue)) {
      out.push(`    \u2514\u2500 Custom validation error`);
      if ("params" in issue && issue.params) {
        out.push(`    \u2514\u2500 Params: ${JSON.stringify(issue.params)}`);
      }
      out.push(`    \u2514\u2500 Input: ${inputStr}`);
      return out;
    }
    out.push(`    \u2514\u2500 [Unhandled Zod issue type]`);
    return out;
  }
};
exports.ZodValidationPipe = __decorateClass([
  common.Injectable()
], exports.ZodValidationPipe);

// src/decorators/zod-body.decorator.ts
function ZodBody(schema, schemaName) {
  return common.Body(new exports.ZodValidationPipe(schema, schemaName));
}
function ZodParam(schema, schemaName) {
  return common.Param(new exports.ZodValidationPipe(schema, schemaName));
}
function ZodQuery(schema, schemaName) {
  return common.Query(new exports.ZodValidationPipe(schema, schemaName));
}
exports.AllExceptionsFilter = class AllExceptionsFilter {
  logger = new core.ConsoleLogger("AllExceptionsFilter");
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let status = common.HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    if (exception instanceof common.HttpException) {
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
exports.AllExceptionsFilter = __decorateClass([
  common.Catch()
], exports.AllExceptionsFilter);
exports.HttpExceptionFilter = class HttpExceptionFilter {
  logger = new core.ConsoleLogger("HttpExceptionFilter");
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
exports.HttpExceptionFilter = __decorateClass([
  common.Catch(common.HttpException)
], exports.HttpExceptionFilter);
exports.LoggingInterceptor = class LoggingInterceptor {
  logger = new core.ConsoleLogger("LoggingInterceptor");
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
      operators.tap({
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
exports.LoggingInterceptor = __decorateClass([
  common.Injectable()
], exports.LoggingInterceptor);
var apiResponseDecoratorOptionsSchema = zod.z.object({
  /** HTTP status code */
  status: zod.z.number().int().min(100).max(599),
  /** Response description */
  description: zod.z.string(),
  /** Response type/DTO class */
  type: zod.z.custom().optional(),
  /** Whether the response is an array */
  isArray: zod.z.boolean().optional().default(false)
});
function ApiSuccessResponse(options) {
  const decorators = [
    swagger.ApiResponse({
      status: options.status,
      description: options.description,
      type: options.type,
      isArray: options.isArray
    })
  ];
  return common.applyDecorators(...decorators);
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
  return swagger.ApiResponse({
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
  return common.applyDecorators(
    ApiErrorResponse(400, "Bad Request - Validation failed"),
    ApiErrorResponse(401, "Unauthorized - Authentication required"),
    ApiErrorResponse(403, "Forbidden - Insufficient permissions"),
    ApiErrorResponse(404, "Not Found - Resource not found"),
    ApiErrorResponse(429, "Too Many Requests - Rate limit exceeded"),
    ApiErrorResponse(500, "Internal Server Error")
  );
}
function ApiPaginatedResponse(dataType, description) {
  return swagger.ApiResponse({
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
var swaggerUiOptionsSchema = zod.z.object({
  /** Persist authorization data in browser @default true */
  persistAuthorization: zod.z.boolean().optional(),
  /** Display request duration in responses @default true */
  displayRequestDuration: zod.z.boolean().optional(),
  /** Sort tags alphabetically @default 'alpha' */
  tagsSorter: zod.z.union([zod.z.literal("alpha"), zod.z.function()]).optional(),
  /** Sort operations alphabetically @default 'alpha' */
  operationsSorter: zod.z.union([zod.z.literal("alpha"), zod.z.literal("method"), zod.z.function()]).optional()
});
var swaggerSetupOptionsSchema = zod.z.object({
  /** API title shown in Swagger UI @default 'API Documentation' */
  title: zod.z.string().optional(),
  /** API description @default 'REST API documentation' */
  description: zod.z.string().optional(),
  /** API version @default '1.0' */
  version: zod.z.string().optional(),
  /** Path where Swagger UI will be available @default 'api' */
  path: zod.z.string().optional(),
  /** Whether to add Bearer authentication support @default true */
  addBearerAuth: zod.z.boolean().optional(),
  /** Custom Swagger UI options */
  swaggerUiOptions: swaggerUiOptionsSchema.optional()
});
function setupSwagger(app, options) {
  const { title = "API Documentation", description = "REST API documentation", version = "1.0", path = "api", addBearerAuth = true, swaggerUiOptions = {} } = options || {};
  let configBuilder = new swagger.DocumentBuilder().setTitle(title).setDescription(description).setVersion(version);
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
  const document = swagger.SwaggerModule.createDocument(app, config);
  const defaultSwaggerUiOptions = {
    persistAuthorization: true,
    displayRequestDuration: true,
    tagsSorter: "alpha",
    operationsSorter: "alpha"
  };
  swagger.SwaggerModule.setup(path, app, document, {
    swaggerOptions: {
      ...defaultSwaggerUiOptions,
      ...swaggerUiOptions
    }
  });
}

exports.ApiCommonResponses = ApiCommonResponses;
exports.ApiErrorResponse = ApiErrorResponse;
exports.ApiPaginatedResponse = ApiPaginatedResponse;
exports.ApiSuccessResponse = ApiSuccessResponse;
exports.MAX_ITEMS_PER_PAGE = MAX_ITEMS_PER_PAGE;
exports.ZodBody = ZodBody;
exports.ZodParam = ZodParam;
exports.ZodQuery = ZodQuery;
exports.apiResponseDecoratorOptionsSchema = apiResponseDecoratorOptionsSchema;
exports.apiResponseMetaSchema = apiResponseMetaSchema;
exports.authenticatedUserSchema = authenticatedUserSchema;
exports.calculatePaginationMeta = calculatePaginationMeta;
exports.createApiResponseSchema = createApiResponseSchema;
exports.createPaginatedResult = createPaginatedResult;
exports.createPaginatedResultSchema = createPaginatedResultSchema;
exports.errorResponseSchema = errorResponseSchema;
exports.extractUuids = extractUuids;
exports.generateUniqueSlug = generateUniqueSlug;
exports.idParamSchema = idParamSchema;
exports.isCustomIssue = isCustomIssue;
exports.isInvalidElement = isInvalidElement;
exports.isInvalidFormat = isInvalidFormat;
exports.isInvalidKey = isInvalidKey;
exports.isInvalidType = isInvalidType;
exports.isInvalidUnion = isInvalidUnion;
exports.isInvalidValue = isInvalidValue;
exports.isNotMultipleOf = isNotMultipleOf;
exports.isTooBig = isTooBig;
exports.isTooSmall = isTooSmall;
exports.isUnrecognizedKeys = isUnrecognizedKeys;
exports.isValidSlug = isValidSlug;
exports.isValidUuid = isValidUuid;
exports.isValidUuidV4 = isValidUuidV4;
exports.normalizePagination = normalizePagination;
exports.offsetPaginationSchema = offsetPaginationSchema;
exports.optionalSlugSchema = optionalSlugSchema;
exports.optionalUuidSchema = optionalUuidSchema;
exports.paginationMetaSchema = paginationMetaSchema;
exports.paginationParamsSchema = paginationParamsSchema;
exports.paginationQueryCoerceSchema = paginationQueryCoerceSchema;
exports.paginationQuerySchema = paginationQuerySchema;
exports.readInput = readInput;
exports.setupSwagger = setupSwagger;
exports.slugParamSchema = slugParamSchema;
exports.slugSchema = slugSchema;
exports.slugify = slugify;
exports.swaggerSetupOptionsSchema = swaggerSetupOptionsSchema;
exports.swaggerUiOptionsSchema = swaggerUiOptionsSchema;
exports.toOffsetPagination = toOffsetPagination;
exports.uuidArraySchema = uuidArraySchema;
exports.uuidSchema = uuidSchema;
exports.uuidV4Schema = uuidV4Schema;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map