import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect, beforeEach } from 'vitest';
import { Context } from 'koa';
import { DefaultErrorHandler } from '@/infrastructure/koa/defaultErrorHandler';
import { NotFoundError } from '@/error/notFound.error';
import { Container } from 'inversify';
import { LoggerProvider, LoggerSymbol } from '@/infrastructure/logger/logger.provider';
import { DefaultEnv } from '@/infrastructure/env/defaultEnv.provider';
import { EnvSymbol } from '@/index';

describe('ErrorHandler Middleware', () => {
  let errorHandler: DefaultErrorHandler;
  let mockCtx: Partial<Context>;
  let mockNext: () => Promise<void>;
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(EnvSymbol).to(DefaultEnv).inSingletonScope();
    container.bind(LoggerSymbol).to(LoggerProvider).inSingletonScope();
    
    errorHandler = new DefaultErrorHandler(container);
    
    mockCtx = {
      status: 200,
      body: undefined,
    };
    
    mockNext = async () => {};
  });

  describe('handle()', () => {
    it('should handle NotFoundError with 404', () => {
      const error = new NotFoundError('users', '123');
      
      errorHandler.handle(mockCtx as Context, error);
      
      expect(mockCtx.status).toBe(404);
      expect(mockCtx.body).toEqual({
        error: 'Not Found',
        message: 'users not found: 123',
        code: 'NOT_FOUND',
      });
    });

    it('should handle MongoDB E11000 duplicate key with 409', () => {
      const error = {
        name: 'MongoError',
        message: 'E11000 duplicate key error',
        code: '11000',
        keyValue: { email: 'test@test.com' },
      } as Error & { code: string; keyValue: unknown };
      
      errorHandler.handle(mockCtx as Context, error);
      
      expect(mockCtx.status).toBe(409);
      expect(mockCtx.body).toMatchObject({
        error: 'Duplicate key error',
        code: 'E11000',
        details: { email: 'test@test.com' },
      });
    });

    it('should handle CastError with 400', () => {
      const error = {
        name: 'CastError',
        message: 'Cast to ObjectId failed',
      } as Error;
      
      errorHandler.handle(mockCtx as Context, error);
      
      expect(mockCtx.status).toBe(400);
      expect(mockCtx.body).toMatchObject({
        error: 'Invalid ID format',
        code: 'CAST_ERROR',
      });
    });

    it('should handle ValidationError with 400', () => {
      const error = {
        name: 'ValidationError',
        message: 'Validation failed',
      } as Error;
      
      errorHandler.handle(mockCtx as Context, error);
      
      expect(mockCtx.status).toBe(400);
      expect(mockCtx.body).toMatchObject({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
      });
    });

    it('should handle unknown errors with 500', () => {
      const error = new Error('Something went wrong');
      
      errorHandler.handle(mockCtx as Context, error);
      
      expect(mockCtx.status).toBe(500);
      expect(mockCtx.body).toEqual({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    });
  });

  describe('middleware()', () => {
    it('should catch errors and call handle()', async () => {
      const middleware = errorHandler.middleware();
      const error = new NotFoundError('users', '123');
      
      mockNext = async () => {
        throw error;
      };
      
      await middleware(mockCtx as Context, mockNext);
      
      expect(mockCtx.status).toBe(404);
    });

    it('should not catch when no error', async () => {
      const middleware = errorHandler.middleware();
      
      await middleware(mockCtx as Context, mockNext);
      
      expect(mockCtx.status).toBe(200);
      expect(mockCtx.body).toBeUndefined();
    });
  });

  describe('custom error handler', () => {
    it('should allow custom error handling', () => {
      class CustomErrorHandler extends DefaultErrorHandler {
        protected handleCustomError(ctx: Context, error: Error): boolean {
          if (error.message === 'CUSTOM') {
            this.setErrorResponse(ctx, 418, {
              error: 'Custom Error',
              message: 'I am a teapot',
            });
            return true;
          }
          return false;
        }
      }

      const handler = new CustomErrorHandler(container);
      const error = new Error('CUSTOM');
      
      handler.handle(mockCtx as Context, error);
      
      expect(mockCtx.status).toBe(418);
      expect(mockCtx.body).toMatchObject({
        error: 'Custom Error',
      });
    });
  });
});
