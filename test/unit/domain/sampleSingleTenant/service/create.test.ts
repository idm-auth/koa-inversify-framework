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

describe('SampleSingleTenantService - create', () => {
  let realm: RealmEntity;

  beforeAll(async () => {
    await setupShared();
    realm = await createTestRealm('unit-samplesingletenant-service-create');
  });

  afterAll(async () => {
    await deleteTestRealm(realm);
    await teardownShared();
  });

  it('should create a sample without tenantId (uses default db)', async () => {
    const ctx = getContext();
    const dto = {
      name: 'Single Tenant Service Test',
      email: `service-single-${Date.now()}@test.com`,
    };

    await ctx.executionContext.init({ globalTransactionId: uuidv4(), tenantId: null }, async () => {
      const created = await ctx.service.create(dto);

      expect(created).toBeDefined();
      expect(created.name).toBe(dto.name);
      expect(created.email).toBe(dto.email);
    });
  });

  it('should work with tenantId in context (ignores it for single-tenant)', async () => {
    const ctx = getContext();
    const dto = {
      name: 'Single Tenant With TenantId',
      email: `service-single-with-tenant-${Date.now()}@test.com`,
    };

    await ctx.executionContext.init(
      { globalTransactionId: uuidv4(), tenantId: 'ignored-tenant' },
      async () => {
        const created = await ctx.service.create(dto);
        expect(created).toBeDefined();
        expect(created.name).toBe(dto.name);
      }
    );
  });
});
