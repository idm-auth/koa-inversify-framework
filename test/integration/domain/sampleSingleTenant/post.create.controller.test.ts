import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { SampleSingleTenantFrameworkHelper } from './framework.helper';

describe('POST /api/sample-single-tenant - create', () => {
  let helper: SampleSingleTenantFrameworkHelper;

  beforeAll(async () => {
    helper = new SampleSingleTenantFrameworkHelper('create');
    await helper.init();
  });

  afterAll(async () => {
    await helper.shutdown();
  });

  describe('Authentication', () => {
    it('should reject request without token', async () => {
      await request(helper.getApp().callback())
        .post('/api/sample-single-tenant')
        .send({ name: 'Test', email: 'test@test.com' })
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(helper.getApp().callback())
        .post('/api/sample-single-tenant')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Test', email: 'test@test.com' })
        .expect(401);
    });
  });

  describe('Validation', () => {
    it('should return 400 when name is missing', async () => {
      await request(helper.getApp().callback())
        .post('/api/sample-single-tenant')
        .set('Authorization', 'Bearer test-valid-token')
        .send({ email: 'test@example.com' })
        .expect(400);
    });

    it('should return 400 when email is invalid', async () => {
      await request(helper.getApp().callback())
        .post('/api/sample-single-tenant')
        .set('Authorization', 'Bearer test-valid-token')
        .send({ name: 'Test', email: 'invalid-email' })
        .expect(400);
    });

    it('should return 400 when body is empty', async () => {
      await request(helper.getApp().callback())
        .post('/api/sample-single-tenant')
        .set('Authorization', 'Bearer test-valid-token')
        .send({})
        .expect(400);
    });
  });

  describe('Success', () => {
    it('should create sample', async () => {
      const response = await request(helper.getApp().callback())
        .post('/api/sample-single-tenant')
        .set('Authorization', 'Bearer test-valid-token')
        .send({ name: 'Create Test', email: `create-${Date.now()}@test.com` })
        .expect(201);

      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe('Create Test');
    });
  });
});
