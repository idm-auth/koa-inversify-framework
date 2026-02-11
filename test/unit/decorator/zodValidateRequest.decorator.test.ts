import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ZodValidateRequest, getZodValidationMetadata } from '@/decorator/zodValidateRequest.decorator';

describe('ZodValidateRequest Decorator', () => {
  it('should store validation metadata for body', () => {
    const bodySchema = z.object({ name: z.string() });

    class TestController {
      @ZodValidateRequest({ body: bodySchema })
      createMethod() {}
    }

    const metadata = getZodValidationMetadata(TestController);
    expect(metadata.createMethod).toEqual({ body: bodySchema });
  });

  it('should store validation metadata for params', () => {
    const paramsSchema = z.object({ id: z.string() });

    class TestController {
      @ZodValidateRequest({ params: paramsSchema })
      getByIdMethod() {}
    }

    const metadata = getZodValidationMetadata(TestController);
    expect(metadata.getByIdMethod).toEqual({ params: paramsSchema });
  });

  it('should store validation metadata for query', () => {
    const querySchema = z.object({ page: z.number() });

    class TestController {
      @ZodValidateRequest({ query: querySchema })
      listMethod() {}
    }

    const metadata = getZodValidationMetadata(TestController);
    expect(metadata.listMethod).toEqual({ query: querySchema });
  });

  it('should handle multiple validation schemas', () => {
    const bodySchema = z.object({ name: z.string() });
    const paramsSchema = z.object({ id: z.string() });

    class TestController {
      @ZodValidateRequest({ body: bodySchema, params: paramsSchema })
      updateMethod() {}
    }

    const metadata = getZodValidationMetadata(TestController);
    expect(metadata.updateMethod).toEqual({
      body: bodySchema,
      params: paramsSchema,
    });
  });
});
