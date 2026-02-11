import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect, beforeEach } from 'vitest';
import { Context, Next } from 'koa';
import { Container } from 'inversify';
import { z } from 'zod';
import { buildZodValidateRequest } from '@/infrastructure/koa/middleware/zodValidateRequest.build.middleware';
import { ZodValidateRequest } from '@/decorator/zodValidateRequest.decorator';
import { createTestContainer } from './setup';

describe('ZodValidateRequest - Multiple Validation', () => {
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

  it('should validate multiple schemas (params + body)', async () => {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const bodySchema = z.object({ name: z.string() });

    class TestController {
      @ZodValidateRequest({ params: paramsSchema, body: bodySchema })
      testMethod() {}
    }

    const middleware = buildZodValidateRequest(
      TestController,
      'testMethod',
      container
    )!;

    mockCtx.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
    mockCtx.request!.body = { name: 'Test' };

    await middleware(mockCtx as Context, mockNext);

    expect(nextCalled).toBe(true);
    expect(mockCtx.status).toBe(200);
  });

  it('should collect errors from multiple schemas', async () => {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const bodySchema = z.object({ name: z.string() });

    class TestController {
      @ZodValidateRequest({ params: paramsSchema, body: bodySchema })
      testMethod() {}
    }

    const middleware = buildZodValidateRequest(
      TestController,
      'testMethod',
      container
    )!;

    mockCtx.params = { id: 'invalid' };
    mockCtx.request!.body = { name: 123 };

    await middleware(mockCtx as Context, mockNext);

    expect(nextCalled).toBe(false);
    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toMatchObject({
      error: 'Validation failed',
      details: expect.arrayContaining([
        expect.objectContaining({ path: expect.stringContaining('params.') }),
        expect.objectContaining({ path: expect.stringContaining('body.') }),
      ]),
    });
  });
});
