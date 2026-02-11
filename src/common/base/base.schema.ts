import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

/**
 * DocIdSchema - Document ID (UUID v4)
 *
 * ALWAYS import and reuse this schema for document IDs (_id fields).
 *
 * Features:
 * - UUID v4 format validation
 * - Used for MongoDB document _id fields
 * - Custom error message for invalid IDs
 *
 * Usage:
 * ```typescript
 * import { DocIdSchema, DocId } from '@/domains/commons/base/base.schema';
 *
 * const mySchema = z.object({
 *   id: DocIdSchema,
 * });
 *
 * // Type usage
 * const findById = async (id: DocId) => { ... }
 * ```
 *
 * DO NOT recreate UUID validation - always import this schema.
 */
export const DocIdSchema = z
  .uuidv4('Invalid ID')
  .openapi({ description: 'Unique identifier (UUID v4)' });
export type DocId = z.infer<typeof DocIdSchema>;

/**
 * PublicUUIDSchema - Public UUID (UUID v4)
 *
 * ALWAYS import and reuse this schema for public identifiers (tenantId, etc).
 *
 * Features:
 * - UUID v4 format validation
 * - Used for tenant IDs and other public identifiers
 * - Custom error message for invalid UUIDs
 *
 * Usage:
 * ```typescript
 * import { publicUUIDSchema, PublicUUID } from '@/domains/commons/base/base.schema';
 *
 * const mySchema = z.object({
 *   tenantId: publicUUIDSchema,
 * });
 *
 * // Type usage
 * const create = async (tenantId: PublicUUID, data: EntityCreate) => { ... }
 * ```
 *
 * DO NOT recreate UUID validation - always import this schema.
 */
export const publicUUIDSchema = z
  .uuidv4('Invalid UUID')
  .openapi({ description: 'public identifier (UUID v4)' });
export type PublicUUID = z.infer<typeof publicUUIDSchema>;

/**
 * MetadataSchema - Timestamps metadata
 *
 * ALWAYS import and reuse this schema for entity metadata (createdAt, updatedAt).
 *
 * Features:
 * - Converts Date objects to ISO 8601 strings
 * - Used for MongoDB timestamps
 *
 * Usage:
 * ```typescript
 * import { MetadataSchema } from 'koa-inversify-framework/common';
 *
 * const myResponseSchema = z.object({
 *   _id: DocIdSchema,
 *   name: z.string(),
 *   metadata: MetadataSchema,
 * });
 * ```
 */
export const MetadataSchema = z.object({
  createdAt: z.date().transform((date) => date.toISOString()),
  updatedAt: z.date().transform((date) => date.toISOString()),
});
