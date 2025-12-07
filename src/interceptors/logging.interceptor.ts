import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConsoleLogger } from '@bniddam-labs/core';
import type { AuthenticatedUser } from '../types';

/**
 * Interface for authenticated requests with user information
 */
export interface AuthenticatedRequest extends Request {
	user?: AuthenticatedUser;
}

/**
 * HTTP request logging interceptor
 * Logs incoming requests and their completion with duration and status
 *
 * Logs include:
 * - Request method, URL, IP, user agent
 * - User ID if authenticated
 * - Response status code and duration
 * - Error details on failure
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new ConsoleLogger('LoggingInterceptor');

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		// Only intercept HTTP requests
		if (context.getType() !== 'http') {
			return next.handle();
		}

		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();
		const { method, url, ip } = request;
		const userAgent = request.get('User-Agent') ?? '';
		const startTime = Date.now();

		// Get user info if authenticated
		const user = (request as AuthenticatedRequest).user;
		const userId = user?.id ?? 'anonymous';

		this.logger.log(`Incoming Request: ${method} ${url} - IP: ${ip} - User: ${userId} - UserAgent: ${userAgent}`);

		return next.handle().pipe(
			tap({
				next: () => {
					const duration = Date.now() - startTime;
					const { statusCode } = response;

					this.logger.log(`Completed Request: ${method} ${url} - ${statusCode} - ${duration}ms - User: ${userId}`);
				},
				error: (error: Error & { status?: number; statusCode?: number }) => {
					const duration = Date.now() - startTime;
					const statusCode = error.status ?? error.statusCode ?? 500;

					this.logger.error(`Failed Request: ${method} ${url} - ${statusCode} - ${duration}ms - User: ${userId}`, error.stack);
				},
			}),
		);
	}
}
