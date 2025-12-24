import winston from 'winston';

/**
 * Logger class using Winston
 * Provides a simple API similar to NestJS Logger and ConsoleLogger
 *
 * Can be used throughout the application and in consuming projects
 */
export class Logger {
	private readonly winston: winston.Logger;
	private readonly context?: string;

	constructor(context?: string) {
		this.context = context;
		this.winston = winston.createLogger({
			level: process.env.LOG_LEVEL || 'info',
			format: winston.format.combine(
				winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				winston.format.errors({ stack: true }),
				winston.format.splat(),
				winston.format.json(),
			),
			transports: [
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize({
							message: true,
							level: true,
							colors: {
								error: 'red',
								warn: 'yellow',
								info: 'green',
								http: 'magenta',
								verbose: 'cyan',
								debug: 'blue',
								silly: 'gray',
							},
						}),
						winston.format.printf((info) => {
							const ctx = info.context ? `[${info.context}]` : '';
							const stackTrace = info.stack ? `\n${info.stack}` : '';
							const timestamp = info.timestamp || new Date().toISOString();
							return `${timestamp} ${info.level} ${ctx} ${info.message}${stackTrace}`;
						}),
					),
				}),
			],
		});
	}

	/**
	 * Log an informational message
	 */
	log(message: string, ...optionalParams: unknown[]): void {
		this.winston.info(message, {
			context: this.context,
			...this.formatOptionalParams(optionalParams),
		});
	}

	/**
	 * Log an error message
	 */
	error(message: string, stackOrContext?: string | unknown, context?: string): void {
		const isStack = typeof stackOrContext === 'string' && stackOrContext.includes('\n');

		if (isStack) {
			this.winston.error(message, {
				context: context || this.context,
				stack: stackOrContext,
			});
		} else {
			this.winston.error(message, {
				context: this.context,
				metadata: stackOrContext,
			});
		}
	}

	/**
	 * Log a warning message
	 */
	warn(message: string, ...optionalParams: unknown[]): void {
		this.winston.warn(message, {
			context: this.context,
			...this.formatOptionalParams(optionalParams),
		});
	}

	/**
	 * Log a debug message
	 */
	debug(message: string, ...optionalParams: unknown[]): void {
		this.winston.debug(message, {
			context: this.context,
			...this.formatOptionalParams(optionalParams),
		});
	}

	/**
	 * Log a verbose message
	 */
	verbose(message: string, ...optionalParams: unknown[]): void {
		this.winston.verbose(message, {
			context: this.context,
			...this.formatOptionalParams(optionalParams),
		});
	}

	/**
	 * Format optional parameters into a metadata object
	 */
	private formatOptionalParams(params: unknown[]): Record<string, unknown> {
		if (params.length === 0) return {};
		if (params.length === 1 && typeof params[0] === 'object') {
			return { metadata: params[0] };
		}
		return { metadata: params };
	}
}
