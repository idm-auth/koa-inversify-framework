import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect } from 'vitest';
import { SwaggerDoc, SwaggerDocController, getSwaggerDocMetadata, getSwaggerControllerMetadata } from '@/decorator';

describe('SwaggerDoc Decorator', () => {
  it('should handle SwaggerDoc decorator', () => {
    class TestController {
      @SwaggerDoc({
        summary: 'Test endpoint',
        description: 'Test description',
        tags: ['Test'],
        responses: {
          200: {
            description: 'Success',
          },
        },
      })
      testMethod() {}
    }

    const metadata = getSwaggerDocMetadata(TestController);
    expect(metadata.testMethod).toMatchObject({
      summary: 'Test endpoint',
      description: 'Test description',
      tags: ['Test'],
    });
  });

  it('should handle SwaggerDocController decorator', () => {
    @SwaggerDocController({
      name: 'Test Controller',
      description: 'Test controller description',
      tags: ['Test'],
    })
    class TestController {}

    const metadata = getSwaggerControllerMetadata(TestController);
    expect(metadata).toEqual({
      name: 'Test Controller',
      description: 'Test controller description',
      tags: ['Test'],
    });
  });
});
