import { AbstractController } from '@/abstract/AbstractController';
import { ICrudMapper } from '@/abstract/AbstractCrudMapper';
import { ICrudService } from '@/abstract/AbstractCrudService';
import { DtoTypes } from '@/common/dto.types';
import { PaginationQuery, PaginationFilter } from '@/common/pagination.model';
import {
  ContextWithBody,
  ContextWithParams,
  ContextWithParamsAndBody,
  IdWithTenantParam,
} from '@/common/koa-context';
import { TraceAsync } from '@/decorator/trace.decorator';
import { Context } from 'koa';
import { InferSchemaType, Schema } from 'mongoose';

export abstract class AbstractCrudController<
  TSchema extends Schema,
  T extends DtoTypes,
  TCreate extends Partial<InferSchemaType<TSchema>>,
> extends AbstractController {
  protected abstract service: ICrudService<TSchema, TCreate>;
  protected abstract mapper: ICrudMapper<TSchema, T>;

  protected extractPaginationAndFilter(ctx: Context): {
    pagination: PaginationQuery;
    filter: PaginationFilter;
  } {
    const { page, limit, sortBy, descending, ...filter } = ctx.query;
    const pagination: PaginationQuery = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
      sortBy: typeof sortBy === 'string' ? sortBy : undefined,
      descending: descending === 'true',
    };
    return { pagination, filter };
  }

  @TraceAsync()
  async create(ctx: ContextWithBody<T['CreateRequestDto']>): Promise<void> {
    this.log.debug('create: Starting');
    this.validateMultiTenantSetup(ctx);
    const dto = ctx.request.body;
    this.log.debug('create: Creating resource');
    const entity = await this.service.createFromDto(dto);
    const result = this.mapper.toCreateResponseDto(entity);
    this.log.info({ id: entity._id }, 'create: Resource created');
    ctx.status = 201;
    ctx.body = result;
  }

  @TraceAsync()
  async findAllPaginated(ctx: Context): Promise<void> {
    this.log.debug('findAllPaginated: Starting');
    this.validateMultiTenantSetup(ctx);
    const { pagination, filter } = this.extractPaginationAndFilter(ctx);
    this.log.debug({ pagination, filter }, 'findAllPaginated: Executing query');
    const result = await this.service.findAllPaginated(pagination, filter);
    this.log.debug(
      { count: result.items.length },
      'findAllPaginated: Query executed'
    );
    ctx.body = this.mapper.toPaginatedResponse(result);
  }

  @TraceAsync()
  async findById(ctx: ContextWithParams<IdWithTenantParam>): Promise<void> {
    const { id } = ctx.params;
    this.log.debug({ id }, 'findById: Starting');
    this.validateMultiTenantSetup(ctx);
    this.log.debug({ id }, 'findById: Finding resource');
    const entity = await this.service.findById(id);
    this.log.debug({ id, found: !!entity }, 'findById: Resource found');
    ctx.body = this.mapper.toFindByIdResponseDto(entity);
  }

  @TraceAsync()
  async update(
    ctx: ContextWithParamsAndBody<IdWithTenantParam, T['UpdateRequestDto']>
  ): Promise<void> {
    const { id } = ctx.params;
    this.log.debug({ id }, 'update: Starting');
    this.validateMultiTenantSetup(ctx);
    const dto = ctx.request.body;
    this.log.debug({ id }, 'update: Updating resource');
    const entity = await this.service.updateFromDto(id, dto);
    this.log.info({ id }, 'update: Resource updated');
    ctx.body = this.mapper.toUpdateResponseDto(entity);
  }

  @TraceAsync()
  async delete(ctx: ContextWithParams<IdWithTenantParam>): Promise<void> {
    const { id } = ctx.params;
    this.log.debug({ id }, 'delete: Starting');
    this.validateMultiTenantSetup(ctx);
    this.log.debug({ id }, 'delete: Deleting resource');
    // Retrieve entity to ensure input id matches deleted entity id
    const entity = await this.service.delete(id);
    this.log.info({ id: entity._id }, 'delete: Resource deleted');
    ctx.status = 204;
  }
}
