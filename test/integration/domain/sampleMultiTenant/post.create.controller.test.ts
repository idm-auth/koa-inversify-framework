import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { SampleMultiTenantFrameworkHelper } from './framework.helper';

describe('POST /api/realm/:tenantId/sample-multi-tenant - create', () => {
  let helper: SampleMultiTenantFrameworkHelper;

  beforeAll(async () => {
    helper = new SampleMultiTenantFrameworkHelper('create');
    await helper.init();
  });

  afterAll(async () => {
    await helper.shutdown();
  });

  it('should create sample with tenantId', async () => {
    const tenantId = helper.getRealm().publicUUID;
    
    const response = await request(helper.getApp().callback())
      .post(`/api/realm/${tenantId}/sample-multi-tenant`)
      .send({ name: 'Create Test', email: `create-${Date.now()}@test.com` })
      .expect(201);

    expect(response.body._id).toBeDefined();
    expect(response.body.name).toBe('Create Test');
  });
});
