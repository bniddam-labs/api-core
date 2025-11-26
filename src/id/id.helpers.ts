/**
 * Validate if a string is a valid UUID v4
 *
 * @param value - String to validate
 * @returns True if valid UUID v4
 *
 * @example
 * ```ts
 * isValidUuid('123e4567-e89b-12d3-a456-426614174000'); // true
 * isValidUuid('invalid'); // false
 * ```
 */
export function isValidUuid(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validate if a string is specifically a UUID v4
 *
 * @param value - String to validate
 * @returns True if valid UUID v4
 */
export function isValidUuidV4(value: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(value);
}

/**
 * Extract all UUIDs from a string
 *
 * @param text - Text containing UUIDs
 * @returns Array of found UUIDs
 *
 * @example
 * ```ts
 * extractUuids('User 123e4567-e89b-12d3-a456-426614174000 and file abc');
 * // ['123e4567-e89b-12d3-a456-426614174000']
 * ```
 */
export function extractUuids(text: string): string[] {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
  return text.match(uuidRegex) || [];
}
