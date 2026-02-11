import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);

export interface DtoRequestTypes {
  CreateRequestDto: z.infer<z.ZodTypeAny>;
  UpdateRequestDto: z.infer<z.ZodTypeAny>;
}

export interface DtoResponseTypes {
  CreateResponseDto: z.infer<z.ZodTypeAny>;
  FindByIdResponseDto: z.infer<z.ZodTypeAny>;
  FindOneResponseDto: z.infer<z.ZodTypeAny>;
  FindAllResponseDto: z.infer<z.ZodTypeAny>;
  UpdateResponseDto: z.infer<z.ZodTypeAny>;
  DeleteResponseDto: z.infer<z.ZodTypeAny>;
  PaginatedItemDto: z.infer<z.ZodTypeAny>;
}

export interface DtoTypes extends DtoRequestTypes, DtoResponseTypes {}
