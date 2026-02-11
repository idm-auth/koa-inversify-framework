import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { SampleSingleTenantFrameworkHelper } from './framework.helper';

describe('DELETE /api/sample-single-tenant/:id - delete', () => {
  let helper: SampleSingleTenantFrameworkHelper;

  beforeAll(async () => {
    helper = new SampleSingleTenantFrameworkHelper('delete');
    await helper.init();
  });

  afterAll(async () => {
    await helper.shutdown();
  });

  it('should delete sample', async () => {
    const created = await helper.createWithContext({
      name: 'Delete Test',
      email: `delete-${Date.now()}@test.com`,
    });

    await request(helper.getApp().callback())
      .delete(`/api/sample-single-tenant/${created._id}`)
      .expect(204);

    await request(helper.getApp().callback())
      .get(`/api/sample-single-tenant/${created._id}`)
      .expect(404);
  });
});
