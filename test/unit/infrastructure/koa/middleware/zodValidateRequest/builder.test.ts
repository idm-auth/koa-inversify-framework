import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { z } from 'zod';
import { buildZodValidateRequest } from '@/infrastructure/koa/middleware/zodValidateRequest.build.middleware';
import { ZodValidateRequest } from '@/decorator/zodValidateRequest.decorator';
import { createTestContainer } from './setup';

describe('ZodValidateRequest - Builder', () => {
  let container: Container;

  beforeEach(() => {
    container = createTestContainer();
  });

  it('should return null when no validation metadata', () => {
    class TestController {
      testMethod() {}
    }

    const middleware = buildZodValidateRequest(
      TestController,
      'testMethod',
      container
    );

    expect(middleware).toBeNull();
  });

  it('should return middleware when validation metadata exists', () => {
    const schema = z.object({ id: z.string() });

    class TestController {
      @ZodValidateRequest({ params: schema })
      testMethod() {}
    }

    const middleware = buildZodValidateRequest(
      TestController,
      'testMethod',
      container
    );

    expect(middleware).not.toBeNull();
    expect(typeof middleware).toBe('function');
  });
});
