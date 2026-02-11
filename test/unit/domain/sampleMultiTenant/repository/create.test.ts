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

describe('SampleMultiTenantRepository - create', () => {
  let realm: RealmEntity;

  beforeAll(async () => {
    await setupShared();
    realm = await createTestRealm('unit-samplemultitenant-repository-create');
  });

  afterAll(async () => {
    await deleteTestRealm(realm);
    await teardownShared();
  });

  it('should throw error when creating without tenantId in context', async () => {
    const ctx = getContext();
    const sampleData = {
      name: 'Multi Tenant Test',
      email: `multi-${Date.now()}@test.com`,
      isActive: true,
    };

    await ctx.executionContext.init({ globalTransactionId: uuidv4(), tenantId: null }, async () => {
      await expect(ctx.repository.create(sampleData)).rejects.toThrow(
        "Multi-tenant repository 'samplesMultiTenant' requires tenantId in execution context."
      );
    });
  });

  it('should create a sample with tenantId in context', async () => {
    const ctx = getContext();
    const sampleData = {
      name: 'Multi Tenant Test',
      email: `multi-${Date.now()}@test.com`,
      isActive: true,
    };

    await ctx.executionContext.init(
      { globalTransactionId: uuidv4(), tenantId: realm.publicUUID },
      async () => {
        const created = await ctx.repository.create(sampleData);

        expect(created).toBeDefined();
        expect(created.name).toBe(sampleData.name);
        expect(created.email).toBe(sampleData.email);
      }
    );
  });
});
