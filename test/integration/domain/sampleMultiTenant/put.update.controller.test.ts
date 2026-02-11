import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { SampleMultiTenantFrameworkHelper } from './framework.helper';
import { v4 as uuidv4 } from 'uuid';

describe('PUT /api/realm/:tenantId/sample-multi-tenant/:id - update', () => {
  let helper: SampleMultiTenantFrameworkHelper;

  beforeAll(async () => {
    helper = new SampleMultiTenantFrameworkHelper('update');
    await helper.init();
  });

  afterAll(async () => {
    await helper.shutdown();
  });

  it('should update sample with tenantId', async () => {
    const tenantId = helper.getRealm().publicUUID;
    
    const created = await helper.createWithContext(
      { name: 'Update Test', email: `update-${Date.now()}@test.com` }
    );

    const response = await request(helper.getApp().callback())
      .put(`/api/realm/${tenantId}/sample-multi-tenant/${created._id}`)
      .send({ name: 'Updated Name' })
      .expect(200);

    expect(response.body.name).toBe('Updated Name');
  });

  it('should return 404 for non-existent id', async () => {
    const tenantId = helper.getRealm().publicUUID;
    
    await request(helper.getApp().callback())
      .put(`/api/realm/${tenantId}/sample-multi-tenant/${uuidv4()}`)
      .send({ name: 'Updated' })
      .expect(404);
  });
});
