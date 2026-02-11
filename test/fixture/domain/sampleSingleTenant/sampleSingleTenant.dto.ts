import { DocIdSchema } from '@/common/base';
import { emailSchema } from '@/common/field';
import { DtoTypes } from '@/common';
import { z } from 'zod';

export const sampleSingleTenantCreateSchema = z.object({
  name: z.string().min(1),
  email: emailSchema,
});

export const sampleSingleTenantResponseSchema = z.object({
  _id: DocIdSchema,
  name: z.string(),
  email: emailSchema,
  isActive: z.boolean(),
});

export const sampleSingleTenantUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export type SampleSingleTenantCreate = z.infer<typeof sampleSingleTenantCreateSchema>;
export type SampleSingleTenantResponse = z.infer<typeof sampleSingleTenantResponseSchema>;
export type SampleSingleTenantUpdate = z.infer<typeof sampleSingleTenantUpdateSchema>;

export interface SampleSingleTenantDtoTypes extends DtoTypes {
  CreateRequestDto: SampleSingleTenantCreate;
  CreateResponseDto: SampleSingleTenantResponse;
  FindByIdResponseDto: SampleSingleTenantResponse;
  FindOneResponseDto: SampleSingleTenantResponse;
  FindAllResponseDto: SampleSingleTenantResponse[];
  UpdateRequestDto: SampleSingleTenantUpdate;
  UpdateResponseDto: SampleSingleTenantResponse;
  DeleteResponseDto: SampleSingleTenantResponse;
  PaginatedResponseDto: SampleSingleTenantResponse;
}
