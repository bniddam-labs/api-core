import { ArgumentMetadata, BadRequestException, Injectable, Logger, PipeTransform } from '@nestjs/common';
import type { ZodError, ZodIssue, ZodTypeAny } from 'zod';

/* -------------------------------------------------------
 * TYPE GUARDS – ZOD V4 (exhaustifs)
 * ----------------------------------------------------- */

export const isInvalidType = (issue: ZodIssue): issue is Extract<ZodIssue, { code: 'invalid_type' }> => issue.code === 'invalid_type';

export const isInvalidFormat = (issue: ZodIssue): issue is Extract<ZodIssue, { code: 'invalid_format' }> => issue.code === 'invalid_format';

export const isTooSmall = (issue: ZodIssue): issue is Extract<ZodIssue, { code: 'too_small' }> => issue.code === 'too_small';

export const isTooBig = (issue: ZodIssue): issue is Extract<ZodIssue, { code: 'too_big' }> => issue.code === 'too_big';

export const isNotMultipleOf = (issue: ZodIssue): issue is Extract<ZodIssue, { code: 'not_multiple_of' }> => issue.code === 'not_multiple_of';

export const isUnrecognizedKeys = (issue: ZodIssue): issue is Extract<ZodIssue, { code: 'unrecognized_keys' }> => issue.code === 'unrecognized_keys';

export const isInvalidUnion = (issue: ZodIssue): issue is Extract<ZodIssue, { code: 'invalid_union' }> => issue.code === 'invalid_union';

export const isInvalidKey = (issue: ZodIssue): issue is Extract<ZodIssue, { code: 'invalid_key' }> => issue.code === 'invalid_key';

export const isInvalidElement = (issue: ZodIssue): issue is Extract<ZodIssue, { code: 'invalid_element' }> => issue.code === 'invalid_element';

export const isInvalidValue = (issue: ZodIssue): issue is Extract<ZodIssue, { code: 'invalid_value' }> => issue.code === 'invalid_value';

export const isCustomIssue = (issue: ZodIssue): issue is Extract<ZodIssue, { code: 'custom' }> => issue.code === 'custom';

/* -------------------------------------------------------
 * readInput helper (corrige définitivement les erreurs TS)
 * ----------------------------------------------------- */

export function readInput(issue: ZodIssue): string {
	const candidate = issue as { input?: unknown };
	return candidate.input !== undefined ? JSON.stringify(candidate.input) : '<no input>';
}

/* -------------------------------------------------------
 * ZodValidationPipe complet
 * ----------------------------------------------------- */

@Injectable()
export class ZodValidationPipe implements PipeTransform {
	private readonly logger = new Logger(ZodValidationPipe.name);

	constructor(private readonly schema: ZodTypeAny, private readonly schemaName?: string) {}

	transform(value: unknown, metadata: ArgumentMetadata) {
		try {
			return this.schema.parse(value);
		} catch (err) {
			if (err instanceof Error && (err as any).issues) {
				this.logZodValidationError(err as ZodError, value);
				throw new BadRequestException('Validation error');
			}
			throw err;
		}
	}

	/* -------------------------------------------------------
	 * Log complet des erreurs Zod v4
	 * ----------------------------------------------------- */
	private logZodValidationError(error: ZodError, rawData: unknown): void {
		const schemaInfo = this.schemaName ? `Schema: ${this.schemaName}` : 'Schema: <unnamed>';

		const separator = '─'.repeat(80);

		const lines: string[] = ['', separator, '❌ [ZOD VALIDATION ERROR]', schemaInfo, '', 'Issues:'];

		for (const issue of error.issues) {
			lines.push(...this.formatIssue(issue));
		}

		// Log des données brutes
		lines.push('');
		lines.push('Raw data received:');

		const rawString = JSON.stringify(rawData, null, 2);
		if (rawString.length > 3000) {
			lines.push(rawString.slice(0, 3000) + '... [truncated]');
		} else {
			lines.push(rawString);
		}

		lines.push(separator);
		lines.push('');

		this.logger.error(lines.join('\n'));
	}

	/* -------------------------------------------------------
	 * Formatage exhaustif des issues Zod v4
	 * ----------------------------------------------------- */
	private formatIssue(issue: ZodIssue): string[] {
		const path = issue.path.length > 0 ? issue.path.join('.') : '<root>';
		const out: string[] = [`  • ${path}: ${issue.message}`];

		const inputStr = readInput(issue);

		if (isInvalidType(issue)) {
			out.push(`    └─ Expected: ${issue.expected}`);
			out.push(`    └─ Input: ${inputStr}`);
			return out;
		}

		if (isInvalidFormat(issue)) {
			out.push(`    └─ Format: ${issue.format}`);
			if ('pattern' in issue && issue.pattern) {
				out.push(`    └─ Pattern: ${issue.pattern}`);
			}
			out.push(`    └─ Input: ${inputStr}`);
			return out;
		}

		if (isTooSmall(issue)) {
			out.push(`    └─ Minimum: ${issue.minimum}`);
			out.push(`    └─ Inclusive: ${issue.inclusive ?? false}`);
			if (issue.exact) out.push(`    └─ Exact value required`);
			out.push(`    └─ Input: ${inputStr}`);
			return out;
		}

		if (isTooBig(issue)) {
			out.push(`    └─ Maximum: ${issue.maximum}`);
			out.push(`    └─ Inclusive: ${issue.inclusive ?? false}`);
			if (issue.exact) out.push(`    └─ Exact value required`);
			out.push(`    └─ Input: ${inputStr}`);
			return out;
		}

		if (isNotMultipleOf(issue)) {
			out.push(`    └─ Divisor: ${issue.divisor}`);
			out.push(`    └─ Input: ${inputStr}`);
			return out;
		}

		if (isUnrecognizedKeys(issue)) {
			out.push(`    └─ Unrecognized keys: ${issue.keys.join(', ')}`);
			return out;
		}

		if (isInvalidUnion(issue)) {
			out.push(`    └─ Invalid union`);
			if (issue.discriminator) {
				out.push(`    └─ Discriminator: ${issue.discriminator}`);
			}
			out.push(`    └─ Input: ${inputStr}`);
			return out;
		}

		if (isInvalidKey(issue)) {
			out.push(`    └─ Invalid map/record key`);
			out.push(`    └─ Input: ${inputStr}`);
			return out;
		}

		if (isInvalidElement(issue)) {
			out.push(`    └─ Invalid element in map/set`);
			out.push(`    └─ Input: ${inputStr}`);
			return out;
		}

		if (isInvalidValue(issue)) {
			out.push(`    └─ Invalid value: ${issue.values.join(', ')}`);
			out.push(`    └─ Input: ${inputStr}`);
			return out;
		}

		if (isCustomIssue(issue)) {
			out.push(`    └─ Custom validation error`);
			if ('params' in issue && issue.params) {
				out.push(`    └─ Params: ${JSON.stringify(issue.params)}`);
			}
			out.push(`    └─ Input: ${inputStr}`);
			return out;
		}

		// fallback (théoriquement impossible)
		const _exhaustiveCheck: never = issue;
		out.push(`    └─ [Unhandled Zod issue type]`);
		return out;
	}
}
