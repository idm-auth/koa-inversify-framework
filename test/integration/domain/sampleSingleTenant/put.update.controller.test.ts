import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { SampleSingleTenantFrameworkHelper } from './framework.helper';
import { v4 as uuidv4 } from 'uuid';

describe('PUT /api/sample-single-tenant/:id - update', () => {
  let helper: SampleSingleTenantFrameworkHelper;

  beforeAll(async () => {
    helper = new SampleSingleTenantFrameworkHelper('update');
    await helper.init();
  });

  afterAll(async () => {
    await helper.shutdown();
  });

  it('should update sample', async () => {
    const created = await helper.createWithContext({
      name: 'Update Test',
      email: `update-${Date.now()}@test.com`,
    });

    const response = await request(helper.getApp().callback())
      .put(`/api/sample-single-tenant/${created._id}`)
      .send({ name: 'Updated Name' })
      .expect(200);

    expect(response.body.name).toBe('Updated Name');
  });

  it('should return 404 for non-existent id', async () => {
    await request(helper.getApp().callback())
      .put(`/api/sample-single-tenant/${uuidv4()}`)
      .send({ name: 'Updated' })
      .expect(404);
  });
});
