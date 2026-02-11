import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);

export const errorResponseSchema = z
  .object({
    error: z.string(),
    message: z.string().optional(),
    code: z.string().optional(),
    details: z.unknown().optional(),
  })
  .openapi('ErrorResponse');

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
