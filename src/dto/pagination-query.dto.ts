/**
 * Generic pagination query DTO for API endpoints
 * Used for query parameters that control pagination
 *
 * @example
 * ```typescript
 * @Get('users')
 * async getUsers(@Query() query: PaginationQueryDto) {
 *   return this.usersService.findAll(query);
 * }
 * ```
 */
export class PaginationQueryDto {
  /**
   * Page number (1-indexed)
   * @default 1
   */
  page?: number = 1;

  /**
   * Number of items per page
   * @default 10
   */
  limit?: number = 10;

  /**
   * Optional search query
   */
  search?: string;

  /**
   * Field to sort by
   */
  sortBy?: string;

  /**
   * Sort order (ascending or descending)
   * @default 'DESC'
   */
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

/**
 * Type alias for pagination DTO (for backward compatibility)
 * Matches the structure used in the backend
 */
export type PaginationDto = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
};
