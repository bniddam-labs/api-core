import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ErrorResponse } from '../api-response.type';
import type { Request, Response } from 'express';

/**
 * Global exception filter that catches all uncaught exceptions
 * Provides consistent error response formatting and logging
 *
 * In production, sensitive error details are hidden from the response
 * In development, full error details are included for debugging
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Internal server error';
		let errorDetails: Record<string, unknown> = {};

		// Extract status and message from HttpException
		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === 'string') {
				message = exceptionResponse;
			} else if (typeof exceptionResponse === 'object') {
				const responseObj = exceptionResponse as Record<string, unknown>;
				message = (responseObj.message as string) ?? message;

				// In development, include all error details
				if (process.env.NODE_ENV !== 'production') {
					errorDetails = { ...responseObj };
					errorDetails.message = undefined; // Already in message field
					errorDetails.statusCode = undefined; // Already in statusCode field
				}
			}
		}

		// Log the error with full stack trace
		this.logger.error(`Unhandled exception: ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : String(exception));

		// Build error response conforming to ErrorResponse type
		const errorResponse: ErrorResponse = {
			statusCode: status,
			error: this.getErrorName(status),
			message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
			timestamp: new Date().toISOString(),
			path: request.url,
			method: request.method,
		};

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
