import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { SampleMultiTenantFrameworkHelper } from './framework.helper';

describe('DELETE /api/realm/:tenantId/sample-multi-tenant/:id - delete', () => {
  let helper: SampleMultiTenantFrameworkHelper;

  beforeAll(async () => {
    helper = new SampleMultiTenantFrameworkHelper('delete');
    await helper.init();
  });

  afterAll(async () => {
    await helper.shutdown();
  });

  it('should delete sample with tenantId', async () => {
    const tenantId = helper.getRealm().publicUUID;
    
    const created = await helper.createWithContext(
      { name: 'Delete Test', email: `delete-${Date.now()}@test.com` }
    );

    await request(helper.getApp().callback())
      .delete(`/api/realm/${tenantId}/sample-multi-tenant/${created._id}`)
      .expect(204);

    await request(helper.getApp().callback())
      .get(`/api/realm/${tenantId}/sample-multi-tenant/${created._id}`)
      .expect(404);
  });
});
