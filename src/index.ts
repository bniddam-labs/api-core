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
export * from './schemas';
export * from './types';
export * from './helpers';

// NestJS-specific exports
export * from './decorators';
export * from './filters';
export * from './interceptors';
export * from './pipes';
export * from './swagger';
