import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { DocIdSchema, publicUUIDSchema } from '@/common/base';

extendZodWithOpenApi(z);

export const RequestParamsIdSchema = z.object({
  id: DocIdSchema,
});

export const RequestParamsTenantIdSchema = z.object({
  tenantId: publicUUIDSchema,
});

export const RequestParamsIdAndTenantIdSchema = z.object({
  id: DocIdSchema,
  tenantId: publicUUIDSchema,
});
