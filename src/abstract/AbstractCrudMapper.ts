import { AbstractMapper } from '@/abstract/AbstractMapper';
import { DtoTypes } from '@/common/dto.types';
import { Entity } from '@/common/entity.types';
import { PaginatedResponse } from '@/common/pagination.model';
import { Trace } from '@/decorator/trace.decorator';
import { unmanaged } from 'inversify';
import { Schema } from 'mongoose';
import { z } from 'zod';

import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);
export interface ICrudMapper<TSchema extends Schema, T extends DtoTypes> {
  toCreateResponseDto(entity: Entity<TSchema>): T['CreateResponseDto'];
  toFindByIdResponseDto(entity: Entity<TSchema>): T['FindByIdResponseDto'];
  toFindOneResponseDto(entity: Entity<TSchema>): T['FindOneResponseDto'];
  toUpdateResponseDto(entity: Entity<TSchema>): T['UpdateResponseDto'];
  toDeleteResponseDto(entity: Entity<TSchema>): T['DeleteResponseDto'];
  toPaginatedItemDto(entity: Entity<TSchema>): T['PaginatedItemDto'];
  toPaginatedItemsDto(
    entities: Entity<TSchema>[]
  ): Array<T['PaginatedItemDto']>;
  toPaginatedResponse(
    response: PaginatedResponse<Entity<TSchema>>
  ): PaginatedResponse<T['PaginatedItemDto']>;
}

export interface MapperSchemas<T extends DtoTypes> {
  createResponseSchema: z.ZodType<T['CreateResponseDto']>;
  findByIdResponseSchema: z.ZodType<T['FindByIdResponseDto']>;
  findOneResponseSchema: z.ZodType<T['FindOneResponseDto']>;
  updateResponseSchema: z.ZodType<T['UpdateResponseDto']>;
  deleteResponseSchema: z.ZodType<T['DeleteResponseDto']>;
  paginatedItemSchema: z.ZodType<T['PaginatedItemDto']>;
}

export abstract class AbstractCrudMapper<
  TSchema extends Schema,
  T extends DtoTypes,
> extends AbstractMapper implements ICrudMapper<TSchema, T> {
  constructor(@unmanaged() protected schemas: MapperSchemas<T>) {
    super();
  }

  protected toDto(entity: Entity<TSchema>): Record<string, unknown> {
    return entity.toObject();
  }

  @Trace()
  toCreateResponseDto(entity: Entity<TSchema>): T['CreateResponseDto'] {
    return this.schemas.createResponseSchema.parse(this.toDto(entity));
  }

  @Trace()
  toFindByIdResponseDto(entity: Entity<TSchema>): T['FindByIdResponseDto'] {
    return this.schemas.findByIdResponseSchema.parse(this.toDto(entity));
  }

  @Trace()
  toFindOneResponseDto(entity: Entity<TSchema>): T['FindOneResponseDto'] {
    return this.schemas.findOneResponseSchema.parse(this.toDto(entity));
  }

  @Trace()
  toUpdateResponseDto(entity: Entity<TSchema>): T['UpdateResponseDto'] {
    return this.schemas.updateResponseSchema.parse(this.toDto(entity));
  }

  @Trace()
  toDeleteResponseDto(entity: Entity<TSchema>): T['DeleteResponseDto'] {
    return this.schemas.deleteResponseSchema.parse(this.toDto(entity));
  }

  @Trace()
  toPaginatedItemDto(entity: Entity<TSchema>): T['PaginatedItemDto'] {
    return this.schemas.paginatedItemSchema.parse(this.toDto(entity));
  }

  @Trace()
  toPaginatedItemsDto(
    entities: Entity<TSchema>[]
  ): Array<T['PaginatedItemDto']> {
    return entities.map((e) => this.toPaginatedItemDto(e));
  }

  @Trace()
  toPaginatedResponse(
    response: PaginatedResponse<Entity<TSchema>>
  ): PaginatedResponse<T['PaginatedItemDto']> {
    return {
      items: this.toPaginatedItemsDto(response.items),
      pagination: response.pagination,
    };
  }
}
