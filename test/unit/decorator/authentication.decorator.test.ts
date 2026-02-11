import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect } from 'vitest';
import { Authenticated, getAuthenticationMetadata, AuthenticationMetadataMap } from '@/decorator/authentication.decorator';

describe('Authentication Decorator', () => {
  it('should store authentication metadata', () => {
    class TestController {
      @Authenticated({ required: true, schemes: ['bearer'] })
      protectedMethod() {}
    }

    const metadata = getAuthenticationMetadata(TestController) as AuthenticationMetadataMap;
    expect(metadata.protectedMethod).toEqual({
      required: true,
      schemes: ['bearer'],
    });
  });

  it('should handle default options', () => {
    class TestController {
      @Authenticated()
      defaultMethod() {}
    }

    const metadata = getAuthenticationMetadata(TestController) as AuthenticationMetadataMap;
    expect(metadata.defaultMethod).toEqual({});
  });

  it('should handle multiple methods', () => {
    class TestController {
      @Authenticated({ required: true })
      method1() {}

      @Authenticated({ required: false })
      method2() {}
    }

    const metadata = getAuthenticationMetadata(TestController) as AuthenticationMetadataMap;
    expect(metadata.method1).toEqual({ required: true });
    expect(metadata.method2).toEqual({ required: false });
  });
});
