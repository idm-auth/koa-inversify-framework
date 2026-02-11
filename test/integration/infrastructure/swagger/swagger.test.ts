import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { FrameworkTestHelper } from '../../../helpers/frameworkTestHelper';
import { SampleMultiTenantModule } from '../../../fixture/domain/sampleMultiTenant/sampleMultiTenant.module';

describe('Swagger Integration Test', () => {
  let helper: FrameworkTestHelper;

  beforeAll(async () => {
    helper = new FrameworkTestHelper();
    await helper.init();
    new SampleMultiTenantModule(helper.getContainer());
  });

  afterAll(async () => {
    await helper.shutdown();
  });

  it('should serve swagger.json with valid OpenAPI document', async () => {
    const response = await request(helper.getApp().callback())
      .get('/api-docs/swagger.json')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.openapi).toBe('3.0.0');
    expect(response.body.info).toBeDefined();
    expect(response.body.info.title).toBe('API Documentation');
    expect(response.body.paths).toBeDefined();
  });

  it('should document registered controller routes', async () => {
    const response = await request(helper.getApp().callback())
      .get('/api-docs/swagger.json')
      .expect(200);

    const paths = Object.keys(response.body.paths);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths).toContain('/api/realm/{tenantId}/sample-multi-tenant');
    expect(paths).toContain('/api/realm/{tenantId}/sample-multi-tenant/{id}');
  });

  it('should serve swagger UI HTML', async () => {
    const response = await request(helper.getApp().callback())
      .get('/api-docs')
      .expect(200)
      .expect('Content-Type', /html/);

    expect(response.text).toContain('API Documentation');
    expect(response.text).toContain('swagger');
  });
});
