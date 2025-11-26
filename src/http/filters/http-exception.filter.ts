import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { ErrorResponse } from '../api-response.type';
import type { Request, Response } from 'express';

/**
 * Exception filter specifically for HttpException instances
 * Provides detailed error formatting and security-aware logging
 *
 * In production mode, sensitive error details are stripped from 500+ errors
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	catch(exception: HttpException, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		const exceptionResponse = exception.getResponse();

		// Extract message and error from exception response
		let message: string | string[] = 'Internal server error';
		let error = this.getErrorName(status);

		if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
			const responseObj = exceptionResponse as Record<string, unknown>;
			if (responseObj.message) {
				message = responseObj.message as string | string[];
			}
			if (responseObj.error && typeof responseObj.error === 'string') {
				error = responseObj.error;
			}
		} else if (typeof exceptionResponse === 'string') {
			message = exceptionResponse;
		}

		const errorResponse: ErrorResponse = {
			statusCode: status,
			message,
			error,
			timestamp: new Date().toISOString(),
			path: request.url,
			method: request.method,
		};

		// Log error with appropriate level
		if (status >= 500) {
			this.logger.error(`HTTP ${status} Error: ${request.method} ${request.url}`, exception.stack);
		} else {
			this.logger.warn(
				`HTTP ${status} Error: ${request.method} ${request.url} - ${Array.isArray(errorResponse.message) ? errorResponse.message.join(', ') : errorResponse.message}`,
			);
		}

		// In production, sanitize 500+ errors to prevent information leakage
		if (process.env.NODE_ENV === 'production' && status >= 500) {
			errorResponse.message = 'Internal server error';
			errorResponse.error = 'Internal Server Error';
		}

		response.status(status).json(errorResponse);
	}

	/**
	 * Get standard HTTP error name from status code
	 */
	private getErrorName(status: number): string {
		const errorNames: Record<number, string> = {
			400: 'Bad Request',
			401: 'Unauthorized',
			403: 'Forbidden',
			404: 'Not Found',
			409: 'Conflict',
			422: 'Unprocessable Entity',
			429: 'Too Many Requests',
			500: 'Internal Server Error',
			502: 'Bad Gateway',
			503: 'Service Unavailable',
		};
		return errorNames[status] || 'Error';
	}
}
