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

describe('SampleMultiTenantService - create', () => {
  let realm: RealmEntity;

  beforeAll(async () => {
    await setupShared();
    realm = await createTestRealm('unit-samplemultitenant-service-create');
  });

  afterAll(async () => {
    await deleteTestRealm(realm);
    await teardownShared();
  });

  it('should throw error when creating without tenantId in context', async () => {
    const ctx = getContext();
    const dto = {
      name: 'Multi Tenant Service Test',
      email: `service-multi-${Date.now()}@test.com`,
    };

    await ctx.executionContext.init({ globalTransactionId: uuidv4(), tenantId: null }, async () => {
      await expect(ctx.service.create(dto)).rejects.toThrow(
        "Multi-tenant repository 'samplesMultiTenant' requires tenantId in execution context."
      );
    });
  });

  it('should create a sample with tenantId in context', async () => {
    const ctx = getContext();
    const dto = {
      name: 'Multi Tenant Service Test',
      email: `service-multi-${Date.now()}@test.com`,
    };

    await ctx.executionContext.init(
      { globalTransactionId: uuidv4(), tenantId: realm.publicUUID },
      async () => {
        const created = await ctx.service.create(dto);

        expect(created).toBeDefined();
        expect(created.name).toBe(dto.name);
        expect(created.email).toBe(dto.email);
      }
    );
  });
});
