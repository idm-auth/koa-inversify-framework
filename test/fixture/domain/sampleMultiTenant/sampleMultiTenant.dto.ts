import { DocIdSchema } from '@/common/base';
import { emailSchema } from '@/common/field';
import { DtoTypes } from '@/common';
import { z } from 'zod';

export const sampleMultiTenantCreateSchema = z.object({
  name: z.string().min(1),
  email: emailSchema,
});

export const sampleMultiTenantResponseSchema = z.object({
  _id: DocIdSchema,
  name: z.string(),
  email: emailSchema,
  isActive: z.boolean(),
});

export const sampleMultiTenantUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export type SampleMultiTenantCreate = z.infer<typeof sampleMultiTenantCreateSchema>;
export type SampleMultiTenantResponse = z.infer<typeof sampleMultiTenantResponseSchema>;
export type SampleMultiTenantUpdate = z.infer<typeof sampleMultiTenantUpdateSchema>;

export interface SampleMultiTenantDtoTypes extends DtoTypes {
  CreateRequestDto: SampleMultiTenantCreate;
  CreateResponseDto: SampleMultiTenantResponse;
  FindByIdResponseDto: SampleMultiTenantResponse;
  FindOneResponseDto: SampleMultiTenantResponse;
  FindAllResponseDto: SampleMultiTenantResponse[];
  UpdateRequestDto: SampleMultiTenantUpdate;
  UpdateResponseDto: SampleMultiTenantResponse;
  DeleteResponseDto: SampleMultiTenantResponse;
  PaginatedResponseDto: SampleMultiTenantResponse;
}
