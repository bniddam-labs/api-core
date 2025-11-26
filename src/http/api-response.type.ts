/**
 * Standard API response envelope type
 *
 * Provides a consistent structure for API responses with optional metadata.
 *
 * @template T - The type of data being returned
 *
 * @example
 * ```typescript
 * import type { ApiResponse } from '@saas/api-core';
 *
 * // Simple response
 * const response: ApiResponse<User> = {
 *   data: user,
 * };
 *
 * // Response with metadata
 * const response: ApiResponse<User[]> = {
 *   data: users,
 *   meta: {
 *     timestamp: new Date().toISOString(),
 *     requestId: '123',
 *   },
 * };
 * ```
 */
export interface ApiResponse<T> {
  /**
   * The response data
   */
  data: T;

  /**
   * Optional metadata about the response
   */
  meta?: Record<string, any>;
}

/**
 * Standard API error response type
 *
 * @example
 * ```typescript
 * import type { ErrorResponse } from '@saas/api-core';
 *
 * const errorResponse: ErrorResponse = {
 *   statusCode: 400,
 *   message: 'Validation failed',
 *   error: 'Bad Request',
 *   timestamp: new Date().toISOString(),
 *   path: '/api/users',
 *   method: 'POST',
 * };
 * ```
 */
export interface ErrorResponse {
  /**
   * HTTP status code
   */
  statusCode: number;

  /**
   * Error message(s)
   */
  message: string | string[];

  /**
   * Error type
   */
  error: string;

  /**
   * Timestamp when the error occurred
   */
  timestamp?: string;

  /**
   * Request path that caused the error
   */
  path?: string;

  /**
   * HTTP method used
   */
  method?: string;
}
