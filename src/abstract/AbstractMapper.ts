import { AbstractBase } from '@/abstract/AbstractBase';

/**
 * AbstractMapper - Base class for all mappers
 * 
 * Provides mapper-specific infrastructure:
 * - Logger with stereotype context (inherited from AbstractBase)
 * 
 * Extended by:
 * - AbstractCrudMapper (for CRUD DTO transformations)
 * - Custom mappers (for non-CRUD transformations)
 */
export abstract class AbstractMapper extends AbstractBase {
  // Mapper-specific methods can be added here in the future
}
