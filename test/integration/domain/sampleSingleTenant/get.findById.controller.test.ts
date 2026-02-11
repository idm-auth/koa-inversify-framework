import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { SampleSingleTenantFrameworkHelper } from './framework.helper';
import { v4 as uuidv4 } from 'uuid';

describe('GET /api/sample-single-tenant/:id - findById', () => {
  let helper: SampleSingleTenantFrameworkHelper;

  beforeAll(async () => {
    helper = new SampleSingleTenantFrameworkHelper('findbyid');
    await helper.init();
  });

  afterAll(async () => {
    await helper.shutdown();
  });

  it('should find sample by id', async () => {
    const created = await helper.createWithContext({
      name: 'FindById Test',
      email: `findbyid-${Date.now()}@test.com`,
    });

    const response = await request(helper.getApp().callback())
      .get(`/api/sample-single-tenant/${created._id}`)
      .expect(200);

    expect(response.body._id).toBe(created._id.toString());
    expect(response.body.name).toBe('FindById Test');
  });

  it('should return 404 for non-existent id', async () => {
    await request(helper.getApp().callback())
      .get(`/api/sample-single-tenant/${uuidv4()}`)
      .expect(404);
  });
});
