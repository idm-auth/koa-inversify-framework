import { Context, Next } from 'koa';
import { Container } from 'inversify';
import { ErrorResponse } from '@/error/error.schema';
import { NotFoundError } from '@/error/notFound.error';
import { UnauthorizedError } from '@/error';
import { LoggerProvider, LoggerSymbol } from '@/infrastructure/logger/logger.provider';

export abstract class AbstractErrorHandler {
  constructor(protected container: Container) {}

  handle(
    ctx: Context,
    error: Error & { code?: string; keyValue?: unknown }
  ): void {
    const loggerProvider = this.container.get<LoggerProvider>(LoggerSymbol);
    const logger = loggerProvider.getLogger();
    
    logger.error(
      {
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name,
        },
        request: {
          method: ctx.method,
          url: ctx.url,
          headers: ctx.headers,
        },
      },
      'Error handler caught exception'
    );

    // Custom error handling has priority (allows overwriting default behavior)
    if (this.handleCustomError(ctx, error)) {
      return;
    }

    // UnauthorizedError
    if (error instanceof UnauthorizedError) {
      this.setErrorResponse(ctx, 401, {
        error: 'Unauthorized',
        message: error.message,
        code: 'UNAUTHORIZED',
      });
      return;
    }

    // NotFoundError
    if (error instanceof NotFoundError) {
      this.setErrorResponse(ctx, 404, {
        error: 'Not Found',
        message: error.message,
        code: 'NOT_FOUND',
      });
      return;
    }

    // MongoDB E11000 - Duplicate key error
    if (error.message?.includes('E11000') || error.code === '11000') {
      this.setErrorResponse(ctx, 409, {
        error: 'Duplicate key error',
        message: 'A record with this value already exists',
        code: 'E11000',
        details: error.keyValue,
      });
      return;
    }

    // MongoDB CastError - Invalid ID format
    if (error.name === 'CastError') {
      this.setErrorResponse(ctx, 400, {
        error: 'Invalid ID format',
        message: error.message,
        code: 'CAST_ERROR',
      });
      return;
    }

    // MongoDB ValidationError
    if (error.name === 'ValidationError') {
      this.setErrorResponse(ctx, 400, {
        error: 'Validation error',
        message: error.message,
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    // Default - Internal Server Error
    this.setErrorResponse(ctx, 500, {
      error: 'Internal Server Error',
      message: error.message,
    });
  }

  protected handleCustomError(_ctx: Context, _error: Error): boolean {
    // Override this method to add custom error handling
    // Return true if error was handled, false otherwise
    return false;
  }

  middleware() {
    return async (ctx: Context, next: Next): Promise<void> => {
      try {
        await next();
      } catch (err) {
        this.handle(ctx, err as Error & { code?: string; keyValue?: unknown });
      }
    };
  }

  protected setErrorResponse(
    ctx: Context,
    status: number,
    response: ErrorResponse
  ): void {
    ctx.status = status;
    ctx.body = response;
  }
}
