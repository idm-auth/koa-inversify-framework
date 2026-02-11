import {
  ICrudRepository,
  MongoPaginationOptions,
} from '@/abstract/AbstractCrudMongoRepository';
import { AbstractService } from '@/abstract/AbstractService';
import { DtoRequestTypes } from '@/common/dto.types';
import { CreateInput, Entity } from '@/common/entity.types';
import { PaginatedResponse, PaginationQuery, PaginationFilter } from '@/common/pagination.model';
import { getCurrentSpan, TraceAsync } from '@/decorator/trace.decorator';

import type {
  InferSchemaType,
  QueryFilter,
  Schema,
  UpdateQuery,
} from 'mongoose';

export interface ICrudService<TSchema extends Schema, TCreate> {
  create(data: TCreate): Promise<Entity<TSchema>>;
  createFromDto(dto: unknown): Promise<Entity<TSchema>>;
  findById(id: string): Promise<Entity<TSchema>>;
  findOne(
    filter: QueryFilter<InferSchemaType<TSchema>>
  ): Promise<Entity<TSchema>>;
  findAll(
    filter?: QueryFilter<InferSchemaType<TSchema>>
  ): Promise<Entity<TSchema>[]>;
  update(entity: Entity<TSchema>): Promise<Entity<TSchema>>;
  updateByQuery(
    id: string,
    updateQuery: UpdateQuery<InferSchemaType<TSchema>>
  ): Promise<Entity<TSchema>>;
  updateFromDto(id: string, dto: unknown): Promise<Entity<TSchema>>;
  delete(id: string): Promise<Entity<TSchema>>;
  count(filter?: QueryFilter<InferSchemaType<TSchema>>): Promise<number>;
  findAllPaginated(
    pagination: PaginationQuery,
    filter: PaginationFilter
  ): Promise<PaginatedResponse<Entity<TSchema>>>;
}

export abstract class AbstractCrudService<
  TSchema extends Schema,
  T extends DtoRequestTypes,
  TCreate extends Partial<InferSchemaType<TSchema>>,
>
  extends AbstractService
  implements ICrudService<TSchema, TCreate>
{
  protected abstract repository: ICrudRepository<TSchema>;

  protected abstract buildCreateDataFromDto(
    dto: T['CreateRequestDto']
  ): CreateInput<TSchema>;

  protected abstract buildUpdate(
    entity: Entity<TSchema>,
    dto: T['UpdateRequestDto']
  ): Entity<TSchema>;

  protected abstract buildPaginationFilter(
    filter: PaginationFilter
  ): QueryFilter<InferSchemaType<TSchema>>;

  @TraceAsync()
  async createFromDto(dto: T['CreateRequestDto']): Promise<Entity<TSchema>> {
    this.log.debug('Service creating entity from DTO');
    const createData = this.buildCreateDataFromDto(dto);
    const entity = await this.repository.create(createData);
    this.log.info({ entityId: entity._id }, 'Entity created from DTO');
    return entity;
  }

  @TraceAsync()
  async create(data: TCreate): Promise<Entity<TSchema>> {
    this.log.debug('Service creating entity');
    const entity = await this.repository.create(data as CreateInput<TSchema>);
    this.log.info({ entityId: entity._id }, 'Entity created');
    return entity;
  }

  @TraceAsync()
  async findById(id: string): Promise<Entity<TSchema>> {
    this.log.debug({ id }, 'Finding entity by id');
    return this.repository.findById(id);
  }

  @TraceAsync()
  async findOne(
    filter: QueryFilter<InferSchemaType<TSchema>>
  ): Promise<Entity<TSchema>> {
    this.log.debug({ filter }, 'Finding entity by filter');
    return this.repository.findOne(filter);
  }

  @TraceAsync()
  async findAll(
    filter?: QueryFilter<InferSchemaType<TSchema>>
  ): Promise<Entity<TSchema>[]> {
    this.log.debug({ filter }, 'Finding all entities');
    const entities = await this.repository.findAll(filter);

    const span = getCurrentSpan();
    if (span) {
      span.setAttributes({ count: entities.length });
    }

    return entities;
  }

  @TraceAsync()
  async updateFromDto(
    id: string,
    dto: T['UpdateRequestDto']
  ): Promise<Entity<TSchema>> {
    this.log.debug({ id }, 'Service updating entity from DTO');
    const entity = await this.findById(id);
    const updated = this.buildUpdate(entity, dto);
    const result = await this.update(updated);
    this.log.info({ id }, 'Entity updated from DTO');
    return result;
  }

  @TraceAsync()
  async update(entity: Entity<TSchema>): Promise<Entity<TSchema>> {
    this.log.debug({ id: entity._id }, 'Service updating entity');
    const result = await this.repository.update(entity);
    this.log.info({ id: entity._id }, 'Entity updated');
    return result;
  }

  @TraceAsync()
  async updateByQuery(
    id: string,
    updateQuery: UpdateQuery<InferSchemaType<TSchema>>
  ): Promise<Entity<TSchema>> {
    this.log.debug({ id }, 'Service updating entity by query');
    const entity = await this.repository.updateByQuery(id, updateQuery);
    this.log.info({ id }, 'Entity updated by query');
    return entity;
  }

  @TraceAsync()
  async delete(id: string): Promise<Entity<TSchema>> {
    this.log.debug({ id }, 'Service deleting entity');
    const entity = await this.repository.delete(id);
    this.log.info({ id }, 'Entity deleted');
    return entity;
  }

  @TraceAsync()
  async count(filter?: QueryFilter<InferSchemaType<TSchema>>): Promise<number> {
    this.log.debug({ filter }, 'Counting entities');
    return this.repository.count(filter);
  }

  @TraceAsync()
  async findAllPaginated(
    pagination: PaginationQuery,
    filter: PaginationFilter = {}
  ): Promise<PaginatedResponse<Entity<TSchema>>> {
    this.log.debug(
      { page: pagination.page, limit: pagination.limit },
      'Finding paginated entities'
    );
    const span = getCurrentSpan();
    if (span) {
      span.setAttributes({
        'pagination.page': pagination.page,
        'pagination.limit': pagination.limit,
      });
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const queryFilter = this.buildPaginationFilter(filter);

    const options: MongoPaginationOptions = {
      page: pagination.page,
      limit: pagination.limit,
      skip,
      sortBy: pagination.sortBy,
      descending: pagination.descending,
    };

    const result = await this.repository.findAllPaginated(queryFilter, options);

    if (span) {
      span.setAttributes({
        total: result.pagination.total,
        count: result.items.length,
      });
    }

    return result;
  }
}
