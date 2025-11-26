/**
 * Generic ID parameter DTO
 * Used for route parameters that expect a UUID or string ID
 *
 * @example
 * ```typescript
 * @Get(':id')
 * async findOne(@Param() params: IdParamDto) {
 *   return this.usersService.findOne(params.id);
 * }
 * ```
 */
export class IdParamDto {
  /**
   * Resource identifier (typically a UUID)
   */
  id!: string;
}

/**
 * UUID-specific parameter DTO
 * Can be used when you want to enforce UUID format explicitly
 */
export class UuidParamDto {
  /**
   * UUID identifier
   */
  id!: string;
}
