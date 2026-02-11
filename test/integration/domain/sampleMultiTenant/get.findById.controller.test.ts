import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { SampleMultiTenantFrameworkHelper } from './framework.helper';
import { FrameworkTestHelper } from '../../../helpers/frameworkTestHelper';
import { v4 as uuidv4 } from 'uuid';

describe('GET /api/realm/:tenantId/sample-multi-tenant/:id - findById', () => {
  let helper: SampleMultiTenantFrameworkHelper;

  beforeAll(async () => {
    helper = new SampleMultiTenantFrameworkHelper('findbyid');
    await helper.init();
  });

  afterAll(async () => {
    await helper.shutdown();
  });

  it('should find sample by id with tenantId', async () => {
    const tenantId = helper.getRealm().publicUUID;
    
    const created = await helper.createWithContext(
      { name: 'FindById Test', email: `findbyid-${Date.now()}@test.com` }
    );

    const response = await request(helper.getApp().callback())
      .get(`/api/realm/${tenantId}/sample-multi-tenant/${created._id}`)
      .expect(200);

    expect(response.body._id).toBe(created._id.toString());
    expect(response.body.name).toBe('FindById Test');
  });

  it('should return 404 for non-existent id', async () => {
    const tenantId = helper.getRealm().publicUUID;
    
    await request(helper.getApp().callback())
      .get(`/api/realm/${tenantId}/sample-multi-tenant/${uuidv4()}`)
      .expect(404);
  });

  it('should isolate data between tenants', async () => {
    const baseHelper = new FrameworkTestHelper();
    await baseHelper.init();
    const realm2 = await baseHelper.setupTestRealm('integration-samplemultitenant-findbyid-tenant2', true);

    const created = await helper.createWithContext(
      { name: 'Tenant 1', email: `tenant1-${Date.now()}@test.com` }
    );

    await request(helper.getApp().callback())
      .get(`/api/realm/${realm2.publicUUID}/sample-multi-tenant/${created._id}`)
      .expect(404);
      
    await baseHelper.deleteRealms([realm2]);
    await baseHelper.shutdown();
  });
});
