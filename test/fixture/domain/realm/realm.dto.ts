import { DtoRequestTypes } from '@/common/dto.types';
import { z } from 'zod';

export const realmCreateSchema = z.object({
  name: z.string().min(1),
  dbName: z.string().min(1),
  isActive: z.boolean().optional(),
});

export const realmUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  dbName: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export type RealmRequestCreateDto = z.infer<typeof realmCreateSchema>;
export type RealmRequestUpdateDto = z.infer<typeof realmUpdateSchema>;

export interface RealmDtoTypes extends DtoRequestTypes {
  CreateRequestDto: RealmRequestCreateDto;
  UpdateRequestDto: RealmRequestUpdateDto;
}
