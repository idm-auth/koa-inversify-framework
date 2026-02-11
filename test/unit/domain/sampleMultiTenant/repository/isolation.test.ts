import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  setupShared,
  teardownShared,
  getContext,
  createTestRealm,
  deleteTestRealm,
} from './setup';
import { RealmEntity } from '@test/fixture/domain/realm/realm.entity';

describe('SampleMultiTenantRepository - tenant isolation', () => {
  let realm1: RealmEntity;
  let realm2: RealmEntity;

  beforeAll(async () => {
    await setupShared();
    realm1 = await createTestRealm(
      'unit-samplemultitenant-repository-isolation1'
    );
    realm2 = await createTestRealm(
      'unit-samplemultitenant-repository-isolation2'
    );
  });

  afterAll(async () => {
    await deleteTestRealm(realm1);
    await deleteTestRealm(realm2);
    await teardownShared();
  });

  it('should isolate data between different tenants', async () => {
    const ctx = getContext();
    const sampleData = {
      name: 'Isolated Tenant Test',
      email: `isolated-${Date.now()}@test.com`,
      isActive: true,
    };

    await ctx.executionContext.init(
      { globalTransactionId: uuidv4(), tenantId: realm1.publicUUID },
      async () => {
        await ctx.repository.create(sampleData);
      }
    );

    await ctx.executionContext.init(
      { globalTransactionId: uuidv4(), tenantId: realm2.publicUUID },
      async () => {
        await expect(
          ctx.repository.findByEmail(sampleData.email)
        ).rejects.toThrow('not found');
      }
    );
  });
});
