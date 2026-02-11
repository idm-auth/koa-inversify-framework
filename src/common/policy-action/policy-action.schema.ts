import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { isValidAction } from '@idm-auth/auth-client';

extendZodWithOpenApi(z);

/**
 * PolicyActionSchema - Policy Action validation
 *
 * Format: system:resource:operation
 *
 * Usage:
 * ```typescript
 * import { policyActionSchema } from '@/common/policy-action';
 *
 * const mySchema = z.object({
 *   policyAction: policyActionSchema,
 * });
 * ```
 */
export const policyActionSchema = z
  .string()
  .refine((action) => isValidAction(action), {
    message:
      'Invalid Policy Action format. Expected: system:resource:operation',
  })
  .openapi({ description: 'Policy Action (system:resource:operation)' });

export type PolicyAction = z.infer<typeof policyActionSchema>;
