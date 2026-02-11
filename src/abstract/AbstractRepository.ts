import { AbstractBase } from '@/abstract/AbstractBase';
import {
  getRepositoryOptions,
  RepositoryOptions,
} from '@/stereotype/repository.stereotype';

/**
 * AbstractRepository - Base class for all repositories
 * 
 * Provides repository-specific infrastructure:
 * - Repository options (multiTenant, etc)
 * 
 * Extended by:
 * - AbstractCrudMongoRepository (for MongoDB CRUD operations)
 * - Custom repositories (for non-CRUD operations)
 */
export abstract class AbstractRepository extends AbstractBase {
  protected getOptions(): RepositoryOptions | undefined {
    return getRepositoryOptions(this.constructor);
  }
}
