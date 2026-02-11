import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ZodValidateResponse, getZodValidateResponseMetadata } from '@/decorator/zodValidateResponse.decorator';

describe('ZodValidateResponse Decorator', () => {
  it('should store response validation metadata for single status code', () => {
    const responseSchema = z.object({ id: z.string(), name: z.string() });

    class TestController {
      @ZodValidateResponse({ 200: responseSchema })
      getMethod() {}
    }

    const metadata = getZodValidateResponseMetadata(TestController);
    expect(metadata.getMethod).toEqual({ 200: responseSchema });
  });

  it('should store response validation metadata for multiple status codes', () => {
    const successSchema = z.object({ id: z.string() });
    const errorSchema = z.object({ error: z.string() });

    class TestController {
      @ZodValidateResponse({ 200: successSchema, 400: errorSchema })
      createMethod() {}
    }

    const metadata = getZodValidateResponseMetadata(TestController);
    expect(metadata.createMethod).toEqual({
      200: successSchema,
      400: errorSchema,
    });
  });

  it('should handle multiple methods with different response schemas', () => {
    const userSchema = z.object({ id: z.string(), name: z.string() });
    const listSchema = z.array(userSchema);

    class TestController {
      @ZodValidateResponse({ 200: userSchema })
      getByIdMethod() {}

      @ZodValidateResponse({ 200: listSchema })
      listMethod() {}
    }

    const metadata = getZodValidateResponseMetadata(TestController);
    expect(metadata.getByIdMethod).toEqual({ 200: userSchema });
    expect(metadata.listMethod).toEqual({ 200: listSchema });
  });
});
