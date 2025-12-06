/**
 * Convert a string to a URL-friendly slug
 *
 * - Removes diacritics (accents)
 * - Converts to lowercase
 * - Replaces non-alphanumeric characters with hyphens
 * - Removes leading/trailing hyphens
 * - Collapses multiple hyphens
 *
 * @param value - String to slugify
 * @param fallback - Fallback string if result is empty (default: 'slug')
 * @returns URL-friendly slug
 *
 * @example
 * ```ts
 * slugify('Hello World!'); // 'hello-world'
 * slugify('Café & Restaurant'); // 'cafe-restaurant'
 * slugify('---'); // 'slug'
 * slugify('___', 'default'); // 'default'
 * ```
 */
export function slugify(value: string, fallback: string = 'slug'): string {
	const normalized = value
		.normalize('NFD') // Decompose combined characters
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
		.replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
		.replace(/-{2,}/g, '-'); // Collapse multiple hyphens

	return normalized.length > 0 ? normalized : fallback;
}

/**
 * Generate a unique slug by appending a number if necessary
 *
 * @param value - Base string to slugify
 * @param existingSlugs - Array of existing slugs to check against
 * @param fallback - Fallback string if result is empty
 * @returns Unique slug
 *
 * @example
 * ```ts
 * generateUniqueSlug('my-post', ['my-post', 'my-post-2']); // 'my-post-3'
 * ```
 */
export function generateUniqueSlug(value: string, existingSlugs: string[], fallback?: string): string {
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

/**
 * Validate if a string is a valid slug format
 *
 * @param value - String to validate
 * @returns True if valid slug format
 *
 * @example
 * ```ts
 * isValidSlug('hello-world'); // true
 * isValidSlug('Hello World'); // false
 * isValidSlug('hello_world'); // false
 * ```
 */
export function isValidSlug(value: string): boolean {
	return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}
