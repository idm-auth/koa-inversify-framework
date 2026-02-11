import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect, beforeEach } from 'vitest';
import { Context, Next } from 'koa';
import { Container } from 'inversify';
import { z } from 'zod';
import { buildZodValidateRequest } from '@/infrastructure/koa/middleware/zodValidateRequest.build.middleware';
import { ZodValidateRequest } from '@/decorator/zodValidateRequest.decorator';
import { createTestContainer } from './setup';

describe('ZodValidateRequest - Body Validation', () => {
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

  it('should pass validation with valid body', async () => {
    const schema = z.object({ name: z.string(), age: z.number() });

    class TestController {
      @ZodValidateRequest({ body: schema })
      testMethod() {}
    }

    const middleware = buildZodValidateRequest(
      TestController,
      'testMethod',
      container
    )!;

    mockCtx.request!.body = { name: 'John', age: 30 };

    await middleware(mockCtx as Context, mockNext);

    expect(nextCalled).toBe(true);
    expect(mockCtx.status).toBe(200);
  });

  it('should fail validation with invalid body', async () => {
    const schema = z.object({ name: z.string(), age: z.number() });

    class TestController {
      @ZodValidateRequest({ body: schema })
      testMethod() {}
    }

    const middleware = buildZodValidateRequest(
      TestController,
      'testMethod',
      container
    )!;

    mockCtx.request!.body = { name: 'John', age: 'invalid' };

    await middleware(mockCtx as Context, mockNext);

    expect(nextCalled).toBe(false);
    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toMatchObject({
      error: 'Validation failed',
      details: expect.arrayContaining([
        expect.objectContaining({
          path: 'body.age',
        }),
      ]),
    });
  });
});
