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

describe('SampleSingleTenantService - findByEmail', () => {
  let realm: RealmEntity;

  beforeAll(async () => {
    await setupShared();
    realm = await createTestRealm(
      'unit-samplesingletenant-service-findByEmail'
    );
  });

  afterAll(async () => {
    await deleteTestRealm(realm);
    await teardownShared();
  });

  it('should find a sample by email', async () => {
    const ctx = getContext();
    const dto = {
      name: 'Find Test',
      email: `service-find-${Date.now()}@test.com`,
    };

    await ctx.executionContext.init({ globalTransactionId: uuidv4(), tenantId: null }, async () => {
      const created = await ctx.service.create(dto);
      const found = await ctx.service.findByEmail(dto.email);

      expect(found._id).toEqual(created._id);
      expect(found.name).toBe(dto.name);
      expect(found.email).toBe(dto.email);
    });
  });
});
