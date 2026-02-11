import { AbstractRepository } from '@/abstract/AbstractRepository';
import { EnvKey } from '@/common/env.types';
import { TraceAsync } from '@/decorator/trace.decorator';
import { ExecutionContextNotInitializedError } from '@/error/executionContextNotInitialized.error';
import { TenantIdRequiredError } from '@/error/tenantIdRequired.error';

import {
  AbstractEnv,
  AbstractTenantResolver,
  EnvSymbol,
  TenantResolverSymbol,
} from '@/index';
import {
  ExecutionContextProvider,
  ExecutionContextSymbol,
} from '@/infrastructure/context/executionContext.provider';
import {
  MongoDB,
  MongoDBSymbol,
} from '@/infrastructure/mongodb/mongodb.provider';
import { inject, unmanaged } from 'inversify';
import type {
  HydratedDocument,
  InferSchemaType,
  Model,
  QueryFilter,
  QueryOptions,
  Schema,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import 'reflect-metadata';

export abstract class AbstractMongoRepository<
  TSchema extends Schema,
> extends AbstractRepository {
  @inject(MongoDBSymbol)
  protected mongodb!: MongoDB;

  @inject(EnvSymbol)
  protected env!: AbstractEnv;

  @inject(ExecutionContextSymbol)
  protected executionContext!: ExecutionContextProvider;

  @inject(TenantResolverSymbol)
  protected tenantResolver!: AbstractTenantResolver;

  private modelCache = new Map<string, Model<InferSchemaType<TSchema>>>();

  constructor(
    @unmanaged() protected schema: TSchema,
    @unmanaged() protected collectionName: string
  ) {
    super();
  }

  clearModelCache(): void {
    this.modelCache.clear();
  }

  protected async resolveDbName(): Promise<string> {
    const options = this.getOptions();
    const isMultiTenant = options?.multiTenant ?? false;
    const defaultDbName = this.env.get(EnvKey.MONGODB_CORE_DBNAME);

    this.log.debug({ isMultiTenant }, 'resolveDbName: Starting');

    const ctx = this.executionContext.get();
    this.log.debug(
      {
        hasContext: !!ctx,
        tenantId: ctx?.tenantId,
        globalTransactionId: ctx?.globalTransactionId,
      },
      'resolveDbName: Context check'
    );

    if (!ctx) {
      throw new ExecutionContextNotInitializedError();
    }

    if (isMultiTenant) {
      const tenantId = ctx.tenantId;

      if (!tenantId) {
        throw new TenantIdRequiredError('repository', this.collectionName);
      }

      this.log.debug({ tenantId }, 'resolveDbName: Resolving tenant dbName');
      const resolvedDbName = await this.tenantResolver.getDbName();
      this.log.debug(
        { resolvedDbName },
        'resolveDbName: Tenant dbName resolved'
      );
      return resolvedDbName;
    }

    this.log.debug({ defaultDbName }, 'resolveDbName: Using default dbName');
    return defaultDbName;
  }

  public async getCollection(): Promise<Model<InferSchemaType<TSchema>>> {
    const resolvedDbName = await this.resolveDbName();
    const cacheKey = `${resolvedDbName}:${this.collectionName}`;

    if (!this.modelCache.has(cacheKey)) {
      this.log.debug(
        { dbName: resolvedDbName },
        'Creating model for collection'
      );
      const conn = this.mongodb.getDbConn(resolvedDbName);
      const model = conn.model<InferSchemaType<TSchema>>(
        this.collectionName,
        this.schema,
        this.collectionName
      );
      this.modelCache.set(cacheKey, model);
    }

    return this.modelCache.get(cacheKey)!;
  }

  @TraceAsync()
  async upsert(
    filter: QueryFilter<InferSchemaType<TSchema>>,
    data: UpdateQuery<InferSchemaType<TSchema>> | UpdateWithAggregationPipeline,
    options: QueryOptions<InferSchemaType<TSchema>> = {
      upsert: true,
      new: true,
    }
  ): Promise<HydratedDocument<InferSchemaType<TSchema>>> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(filter, data, options);
    this.log.debug({ filter }, 'Upsert completed');
    return result!;
  }
}
