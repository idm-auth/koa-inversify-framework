import { describe, it, expect } from 'vitest';
import {
  Authorize,
  getAuthorizeMetadata,
} from '@/decorator/authorize.decorator';
import type { IdmAuthGrn } from '@idm-auth/auth-client';

describe('Authorize Decorator', () => {
  it('should store authorization metadata with operation and default resource function', () => {
    class TestController {
      @Authorize({ operation: 'read' })
      authorizedMethod() {}
    }

    const metadata = getAuthorizeMetadata(TestController);
    expect(metadata.authorizedMethod.operation).toBe('read');
    expect(typeof metadata.authorizedMethod.resource).toBe('function');
  });

  it('should handle multiple methods with different operations', () => {
    class TestController {
      @Authorize({ operation: 'list' })
      readMethod() {}

      @Authorize({
        operation: 'create',
        partition: 'global',
        region: 'americas',
      })
      writeMethod() {}
    }

    const metadata = getAuthorizeMetadata(TestController);
    expect(metadata.readMethod.operation).toBe('list');
    expect(metadata.writeMethod.operation).toBe('create');
    expect(metadata.writeMethod.partition).toBe('global');
    expect(metadata.writeMethod.region).toBe('americas');
  });

  it('should allow resource override with custom function', () => {
    const customResourceFn = (grn: IdmAuthGrn): IdmAuthGrn => ({
      ...grn,
      resource: 'custom/path',
    });

    class TestController {
      @Authorize({
        operation: 'read',
        resource: customResourceFn,
      })
      customMethod() {}
    }

    const metadata = getAuthorizeMetadata(TestController);
    expect(metadata.customMethod.operation).toBe('read');
    expect(metadata.customMethod.resource).toBe(customResourceFn);
  });
});
