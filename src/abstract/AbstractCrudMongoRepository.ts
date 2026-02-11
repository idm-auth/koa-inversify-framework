import { AbstractMongoRepository } from '@/abstract/AbstractMongoRepository';
import { CreateInput, Entity } from '@/common/entity.types';
import { PaginatedResponse } from '@/common/pagination.model';
import { TraceAsync } from '@/decorator/trace.decorator';
import { NotFoundError } from '@/error/notFound.error';
import { unmanaged } from 'inversify';
import type {
  InferSchemaType,
  QueryFilter,
  Schema,
  UpdateQuery,
} from 'mongoose';
import 'reflect-metadata';

export interface MongoPaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sortBy?: string;
  descending?: boolean;
}

export interface ICrudRepository<TSchema extends Schema> {
  create(data: CreateInput<TSchema>): Promise<Entity<TSchema>>;
  findById(id: string): Promise<Entity<TSchema>>;
  findOne(
    filter: QueryFilter<InferSchemaType<TSchema>>,
    options: { notFoundReturnNull: true }
  ): Promise<Entity<TSchema> | null>;
  findOne(
    filter: QueryFilter<InferSchemaType<TSchema>>,
    options?: { notFoundReturnNull?: false }
  ): Promise<Entity<TSchema>>;
  findAll(
    filter?: QueryFilter<InferSchemaType<TSchema>>
  ): Promise<Entity<TSchema>[]>;
  findMany(
    filter?: QueryFilter<InferSchemaType<TSchema>>
  ): Promise<Entity<TSchema>[]>;
  findAllPaginated(
    filter: QueryFilter<InferSchemaType<TSchema>>,
    options: MongoPaginationOptions
  ): Promise<PaginatedResponse<Entity<TSchema>>>;
  update(entity: Entity<TSchema>): Promise<Entity<TSchema>>;
  updateByQuery(
    id: string,
    data: UpdateQuery<InferSchemaType<TSchema>>
  ): Promise<Entity<TSchema>>;
  delete(id: string): Promise<Entity<TSchema>>;
  deleteMany(
    filter: QueryFilter<InferSchemaType<TSchema>>
  ): Promise<{ deletedCount: number }>;
  count(filter?: QueryFilter<InferSchemaType<TSchema>>): Promise<number>;
}
/**
 * CRUD Repository - MongoDB Operations
 *
 * Provides standard CRUD operations for MongoDB collections.
 * Extends AbstractMongoRepository for MongoDB connection and tenant resolution.
 */
export abstract class AbstractCrudMongoRepository<TSchema extends Schema>
  extends AbstractMongoRepository<TSchema>
  implements ICrudRepository<TSchema>
{
  constructor(
    @unmanaged() schema: TSchema,
    @unmanaged() collectionName: string
  ) {
    super(schema, collectionName);
  }

  @TraceAsync()
  async create(data: CreateInput<TSchema>): Promise<Entity<TSchema>> {
    this.log.debug('Repository creating document');
    const collection = await this.getCollection();
    const result = await collection.create(data);
    this.log.debug({ id: result._id }, 'Document created');
    return result;
  }

  @TraceAsync()
  async findById(id: string): Promise<Entity<TSchema>> {
    const collection = await this.getCollection();
    const result = await collection.findById(id);
    if (!result) {
      throw new NotFoundError(this.collectionName, id);
    }
    return result;
  }

  async findOne(
    filter: QueryFilter<InferSchemaType<TSchema>>,
    options: { notFoundReturnNull: true }
  ): Promise<Entity<TSchema> | null>;
  async findOne(
    filter: QueryFilter<InferSchemaType<TSchema>>,
    options?: { notFoundReturnNull?: false }
  ): Promise<Entity<TSchema>>;
  @TraceAsync()
  async findOne(
    filter: QueryFilter<InferSchemaType<TSchema>>,
    options: { notFoundReturnNull?: boolean } = {}
  ): Promise<Entity<TSchema> | null> {
    this.log.debug({ filter }, 'findOne: Starting');
    const collection = await this.getCollection();
    this.log.debug('findOne: Collection obtained, executing query');
    const result = await collection.findOne(filter);
    this.log.debug({ found: !!result }, 'findOne: Query executed');
    if (!result && !options.notFoundReturnNull) {
      throw new NotFoundError(this.collectionName, JSON.stringify(filter));
    }
    return result;
  }

  @TraceAsync()
  async findAll(
    filter: QueryFilter<InferSchemaType<TSchema>> = {}
  ): Promise<Entity<TSchema>[]> {
    const collection = await this.getCollection();
    return collection.find(filter);
  }

  @TraceAsync()
  async findMany(
    filter: QueryFilter<InferSchemaType<TSchema>> = {}
  ): Promise<Entity<TSchema>[]> {
    return this.findAll(filter);
  }

  @TraceAsync()
  async findAllPaginated(
    filter: QueryFilter<InferSchemaType<TSchema>>,
    options: MongoPaginationOptions
  ): Promise<PaginatedResponse<Entity<TSchema>>> {
    this.log.debug(
      { page: options.page, limit: options.limit },
      'Repository finding paginated'
    );
    const collection = await this.getCollection();

    let query = collection.find(filter);

    if (options.sortBy) {
      const sortOrder = options.descending ? -1 : 1;
      query = query.sort({ [options.sortBy]: sortOrder });
    }

    query = query.skip(options.skip).limit(options.limit);

    const [items, total] = await Promise.all([
      query.exec(),
      collection.countDocuments(filter),
    ]);

    this.log.debug(
      { count: items.length, total },
      'Paginated results retrieved'
    );

    return {
      items,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  @TraceAsync()
  async update(entity: Entity<TSchema>): Promise<Entity<TSchema>> {
    this.log.debug({ id: entity._id }, 'Repository updating document');
    try {
      await entity.save();
      this.log.debug({ id: entity._id }, 'Document updated');
      return entity;
    } catch (error) {
      this.log.error({ id: entity._id, error }, 'Failed to update document');
      throw error;
    }
  }

  @TraceAsync()
  async updateByQuery(
    id: string,
    data: UpdateQuery<InferSchemaType<TSchema>>
  ): Promise<Entity<TSchema>> {
    const collection = await this.getCollection();
    const result = await collection.findByIdAndUpdate(id, data, { new: true });
    if (!result) {
      throw new NotFoundError(this.collectionName, id);
    }
    return result;
  }

  @TraceAsync()
  async delete(id: string): Promise<Entity<TSchema>> {
    const collection = await this.getCollection();
    const result = await collection.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError(this.collectionName, id);
    }
    return result;
  }

  @TraceAsync()
  async count(
    filter: QueryFilter<InferSchemaType<TSchema>> = {}
  ): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments(filter);
  }

  @TraceAsync()
  async deleteMany(
    filter: QueryFilter<InferSchemaType<TSchema>>
  ): Promise<{ deletedCount: number }> {
    const collection = await this.getCollection();
    const result = await collection.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }
}
