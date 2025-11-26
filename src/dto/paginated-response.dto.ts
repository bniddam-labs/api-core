import type { PaginationMeta } from '@saas/utils';

/**
 * Generic paginated response DTO for API endpoints
 * Provides a consistent structure for paginated data across the application
 *
 * @template T - The type of items in the data array
 *
 * @example
 * ```typescript
 * // In a controller
 * @Get('users')
 * async getUsers(
 *   @Query() paginationDto: PaginationDto
 * ): Promise<PaginatedResponseDto<User>> {
 *   const users = await this.usersService.findAll(paginationDto);
 *   return new PaginatedResponseDto(users, total, page, limit);
 * }
 * ```
 */
export class PaginatedResponseDto<T> {
  /**
   * Array of data items for the current page
   */
  data: T[];

  /**
   * Pagination metadata (page, limit, total, hasNextPage, etc.)
   */
  meta: PaginationMeta;

  /**
   * Creates a paginated response with calculated metadata
   *
   * @param data - Array of items for the current page
   * @param total - Total number of items across all pages
   * @param page - Current page number (1-indexed)
   * @param limit - Number of items per page
   */
  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;

    const totalPages = Math.ceil(total / limit);

    this.meta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
