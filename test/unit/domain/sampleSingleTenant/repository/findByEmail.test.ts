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

describe('SampleSingleTenantRepository - findByEmail', () => {
  let realm: RealmEntity;

  beforeAll(async () => {
    await setupShared();
    realm = await createTestRealm(
      'unit-samplesingletenant-repository-findByEmail'
    );
  });

  afterAll(async () => {
    await deleteTestRealm(realm);
    await teardownShared();
  });

  it('should find a sample by email', async () => {
    const ctx = getContext();
    const sampleData = {
      name: 'Find Test',
      email: `find-${Date.now()}@test.com`,
      isActive: true,
    };

    await ctx.executionContext.init({ globalTransactionId: uuidv4(), tenantId: null }, async () => {
      const created = await ctx.repository.create(sampleData);
      const found = await ctx.repository.findByEmail(sampleData.email);

      expect(found._id).toEqual(created._id);
      expect(found.name).toBe(sampleData.name);
      expect(found.email).toBe(sampleData.email);
    });
  });
});
