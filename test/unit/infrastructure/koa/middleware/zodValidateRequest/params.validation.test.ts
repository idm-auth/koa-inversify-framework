import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect, beforeEach } from 'vitest';
import { Context, Next } from 'koa';
import { Container } from 'inversify';
import { z } from 'zod';
import { buildZodValidateRequest } from '@/infrastructure/koa/middleware/zodValidateRequest.build.middleware';
import { ZodValidateRequest } from '@/decorator/zodValidateRequest.decorator';
import { createTestContainer } from './setup';

describe('ZodValidateRequest - Params Validation', () => {
  let container: Container;
  let mockCtx: Partial<Context>;
  let mockNext: Next;
  let nextCalled: boolean;

  beforeEach(() => {
    container = createTestContainer();

    mockCtx = {
      params: {},
      query: {},
      request: { body: {} } as any,
      status: 200,
      body: undefined,
    };

    nextCalled = false;
    mockNext = async () => {
      nextCalled = true;
    };
  });

  it('should pass validation with valid params', async () => {
    const schema = z.object({ id: z.string().uuid() });

    class TestController {
      @ZodValidateRequest({ params: schema })
      testMethod() {}
    }

    const middleware = buildZodValidateRequest(
      TestController,
      'testMethod',
      container
    )!;

    mockCtx.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

    await middleware(mockCtx as Context, mockNext);

    expect(nextCalled).toBe(true);
    expect(mockCtx.status).toBe(200);
  });

  it('should fail validation with invalid params', async () => {
    const schema = z.object({ id: z.string().uuid() });

    class TestController {
      @ZodValidateRequest({ params: schema })
      testMethod() {}
    }

    const middleware = buildZodValidateRequest(
      TestController,
      'testMethod',
      container
    )!;

    mockCtx.params = { id: 'invalid-uuid' };

    await middleware(mockCtx as Context, mockNext);

    expect(nextCalled).toBe(false);
    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toMatchObject({
      error: 'Validation failed',
      message: 'Request validation failed',
      details: expect.arrayContaining([
        expect.objectContaining({
          path: 'params.id',
        }),
      ]),
    });
  });
});
