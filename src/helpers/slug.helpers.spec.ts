import { describe, expect, it } from 'vitest';
import { generateUniqueSlug, isValidSlug, slugify } from './slug.helpers';

describe('slugify', () => {
  it('should convert string to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should remove diacritics', () => {
    expect(slugify('Café & Restaurant')).toBe('cafe-restaurant');
    expect(slugify('Niño')).toBe('nino');
  });

  it('should replace non-alphanumeric with hyphens', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
    expect(slugify('test@example.com')).toBe('test-example-com');
  });

  it('should collapse multiple hyphens', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
    expect(slugify('Hello---World')).toBe('hello-world');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(slugify('---hello---')).toBe('hello');
  });

  it('should return fallback for empty result', () => {
    expect(slugify('---')).toBe('slug');
    expect(slugify('!!!', 'custom')).toBe('custom');
  });

  it('should handle unicode correctly', () => {
    expect(slugify('Ça va?')).toBe('ca-va');
  });
});

describe('generateUniqueSlug', () => {
  it('should return base slug if unique', () => {
    expect(generateUniqueSlug('my-post', [])).toBe('my-post');
  });

  it('should append number if slug exists', () => {
    expect(generateUniqueSlug('my-post', ['my-post'])).toBe('my-post-2');
  });

  it('should find next available number', () => {
    expect(generateUniqueSlug('my-post', ['my-post', 'my-post-2'])).toBe('my-post-3');
  });

  it('should handle complex scenarios', () => {
    const existing = ['hello', 'hello-2', 'hello-3', 'hello-5'];
    expect(generateUniqueSlug('hello', existing)).toBe('hello-4');
  });
});

describe('isValidSlug', () => {
  it('should validate correct slugs', () => {
    expect(isValidSlug('hello-world')).toBe(true);
    expect(isValidSlug('test123')).toBe(true);
    expect(isValidSlug('my-post-2')).toBe(true);
  });

  it('should reject invalid slugs', () => {
    expect(isValidSlug('Hello World')).toBe(false);
    expect(isValidSlug('hello_world')).toBe(false);
    expect(isValidSlug('hello--world')).toBe(false);
    expect(isValidSlug('-hello')).toBe(false);
    expect(isValidSlug('hello-')).toBe(false);
  });
});
