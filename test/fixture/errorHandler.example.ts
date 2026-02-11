import { AbstractErrorHandler } from '@/infrastructure/koa/middleware/errorHandler.middleware';
import { Context } from 'koa';

/**
 * Custom Error Handler Example
 * 
 * The AbstractErrorHandler already handles:
 * - MongoDB E11000 (Duplicate key) → 409 Conflict
 * - MongoDB CastError (Invalid ID) → 400 Bad Request
 * - MongoDB ValidationError → 400 Bad Request
 * - Default errors → 500 Internal Server Error
 * 
 * Override handleCustomError() to:
 * 1. Add your own custom error handling
 * 2. Override default behavior (return true to prevent default handling)
 */
export class CustomErrorHandler extends AbstractErrorHandler {
  protected handleCustomError(ctx: Context, error: Error): boolean {
    // Example 1: Add custom error handling
    // if (error.name === 'MyCustomError') {
    //   this.setErrorResponse(ctx, 422, {
    //     error: 'Custom error',
    //     message: error.message,
    //     code: 'CUSTOM_ERROR',
    //   });
    //   return true;
    // }

    // Example 2: Override default E11000 handling
    // if (error.message?.includes('E11000')) {
    //   this.setErrorResponse(ctx, 409, {
    //     error: 'Email already exists',
    //     message: 'Please use a different email address',
    //   });
    //   return true;
    // }

    // Return false to let the default handler take over
    return false;
  }
}
