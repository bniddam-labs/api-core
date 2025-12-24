/**
 * @bniddam-labs/api-core
 *
 * Framework-agnostic HTTP API patterns with NestJS adapters
 *
 * This package provides:
 * - Zod schemas, types, and helpers (framework-agnostic)
 * - NestJS: Decorators, pipes, filters, interceptors, Swagger helpers
 */

// Core exports (framework-agnostic)
export * from './schemas/index.js';
export * from './types/index.js';
export * from './helpers/index.js';
export * from './logger/index.js';

// NestJS-specific exports
export * from './decorators/index.js';
export * from './filters/index.js';
export * from './interceptors/index.js';
export * from './pipes/index.js';
export * from './swagger/index.js';
