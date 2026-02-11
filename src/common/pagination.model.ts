import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export type PaginationFilter = Record<string, string | string[] | undefined> & {
  search?: string;
};

export interface PaginationQuery {
  page: number;
  limit: number;
  sortBy?: string;
  descending: boolean;
}

export const paginationMetadataSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export type PaginationMetadata = z.infer<typeof paginationMetadataSchema>;

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}

export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(
  itemSchema: T
) {
  return z.object({
    items: z.array(itemSchema),
    pagination: paginationMetadataSchema,
  });
}
