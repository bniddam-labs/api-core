/**
 * Generic search query DTO
 * Used for endpoints that accept search parameters
 *
 * @example
 * ```typescript
 * @Get('search')
 * async search(@Query() query: SearchQueryDto) {
 *   return this.searchService.search(query.q);
 * }
 * ```
 */
export class SearchQueryDto {
  /**
   * Search query string
   */
  q?: string;
}
