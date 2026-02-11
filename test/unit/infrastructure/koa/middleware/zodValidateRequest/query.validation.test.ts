import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect, beforeEach } from 'vitest';
import { Context, Next } from 'koa';
import { Container } from 'inversify';
import { z } from 'zod';
import { buildZodValidateRequest } from '@/infrastructure/koa/middleware/zodValidateRequest.build.middleware';
import { ZodValidateRequest } from '@/decorator/zodValidateRequest.decorator';
import { createTestContainer } from './setup';

describe('ZodValidateRequest - Query Validation', () => {
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

  it('should pass validation with valid query', async () => {
    const schema = z.object({ page: z.string(), limit: z.string() });

    class TestController {
      @ZodValidateRequest({ query: schema })
      testMethod() {}
    }

    const middleware = buildZodValidateRequest(
      TestController,
      'testMethod',
      container
    )!;

    mockCtx.query = { page: '1', limit: '10' };

    await middleware(mockCtx as Context, mockNext);

    expect(nextCalled).toBe(true);
    expect(mockCtx.status).toBe(200);
  });

  it('should fail validation with invalid query', async () => {
    const schema = z.object({ page: z.string(), limit: z.string() });

    class TestController {
      @ZodValidateRequest({ query: schema })
      testMethod() {}
    }

    const middleware = buildZodValidateRequest(
      TestController,
      'testMethod',
      container
    )!;

    mockCtx.query = { page: '1', limit: '10' } as any;

    await middleware(mockCtx as Context, mockNext);

    expect(nextCalled).toBe(false);
    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toMatchObject({
      error: 'Validation failed',
      details: expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringContaining('query.'),
        }),
      ]),
    });
  });
});
