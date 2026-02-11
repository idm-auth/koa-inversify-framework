import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

/**
 * Common field schemas for reuse across domains
 */

// Validation functions
const validateXSS = (input: string): boolean => {
  const dangerousChars = /<|>|"|'|&|javascript:|data:|vbscript:|on\w+=/i;
  return !dangerousChars.test(input);
};

const validateSSRF = (email: string): boolean => {
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  const blockedDomains = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  const isPrivateIP = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(
    domain
  );
  return !blockedDomains.includes(domain) && !isPrivateIP;
};

/**
 * Email Schema - RFC 5322 Compliant
 *
 * Features:
 * - RFC 5322 email format validation
 * - XSS protection
 * - SSRF protection (blocks localhost, private IPs)
 */
// amazonq-ignore-next-line
export const emailSchema = z
  .email({
    pattern: z.regexes.rfc5322Email,
    error: (issue) =>
      issue.input === undefined || issue.input === ''
        ? 'Email is required'
        : 'Invalid email format',
  })
  .refine(validateXSS, 'Email contains invalid characters')
  .refine(validateSSRF, 'Email domain not allowed')
  .openapi({ description: 'Valid email address' });

export type Email = z.infer<typeof emailSchema>;

export const nameSchema = z
  .string()
  .min(3, 'Name is required')
  .regex(/^[a-zA-Z0-9\s_-]+$/, 'Name contains invalid characters')
  .max(100, 'Name must be at most 100 characters')
  .openapi({
    description: 'Entity name (alphanumeric, spaces, underscore, hyphen)',
  });

export const descriptionSchema = z
  .string()
  .regex(/^[a-zA-Z0-9\s.,!?_-]*$/, 'Description contains invalid characters')
  .max(500, 'Description must be at most 500 characters')
  .openapi({
    description: 'Entity description (alphanumeric, spaces, basic punctuation)',
  });

export const dbNameSchema = z
  .string()
  .min(3, 'Database name is required')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Database name can only contain letters, numbers, underscores and hyphens'
  )
  .max(50, 'Database name must be at most 50 characters')
  .openapi({ description: 'Database name (alphanumeric, underscore, hyphen)' });

export type Name = z.infer<typeof nameSchema>;
export type Description = z.infer<typeof descriptionSchema>;
export type DbName = z.infer<typeof dbNameSchema>;