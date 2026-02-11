// Base abstractions
export { AbstractBase } from './AbstractBase';
export { AbstractController } from './AbstractController';
export { AbstractService } from './AbstractService';
export { AbstractRepository } from './AbstractRepository';
export { AbstractMapper } from './AbstractMapper';

/**
 * IMPORTANT: AbstractEnv and AbstractTenantResolver are NOT exported from here.
 * They are exported from the main index.ts to prevent TypeScript module resolution
 * issues with protected properties. Import them from 'koa-inversify-framework' instead.
 */

// CRUD abstractions
export { AbstractMongoRepository } from './AbstractMongoRepository';
export { AbstractCrudController } from './AbstractCrudController';
export { AbstractCrudMapper } from './AbstractCrudMapper';
export type { MapperSchemas } from './AbstractCrudMapper';
export { AbstractCrudMongoRepository } from './AbstractCrudMongoRepository';
export { AbstractCrudService } from './AbstractCrudService';

// Module abstraction
export { AbstractModule } from './AbstractModule';

// Common types
export type { CreateInput, Entity } from '@/common/entity.types';
