import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { isValidGrn } from '@idm-auth/auth-client';

extendZodWithOpenApi(z);

/**
 * GrnSchema - Global Resource Name (GRN) validation
 *
 * Format: grn:partition:system:region:tenantId:resource
 *
 * Usage:
 * ```typescript
 * import { grnSchema } from 'koa-inversify-framework/common';
 *
 * const mySchema = z.object({
 *   grn: grnSchema,
 * });
 * ```
 */
export const grnSchema = z
  .string()
  .refine((grn) => isValidGrn(grn), {
    message:
      'Invalid GRN format. Expected: grn:partition:system:region:tenantId:resource',
  })
  .openapi({ description: 'Global Resource Name (GRN)' });

export type Grn = z.infer<typeof grnSchema>;
