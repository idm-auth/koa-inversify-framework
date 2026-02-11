import { AbstractBase } from '@/abstract/AbstractBase';
import {
  getServiceOptions,
  ServiceOptions,
} from '@/stereotype/service.stereotype';

/**
 * AbstractService - Base class for all services
 * 
 * Provides service-specific infrastructure:
 * - Service options (multiTenant, etc)
 * 
 * Extended by:
 * - AbstractCrudService (for CRUD operations)
 * - Custom services (for non-CRUD operations)
 */
export abstract class AbstractService extends AbstractBase {
  protected getOptions(): ServiceOptions | undefined {
    return getServiceOptions(this.constructor);
  }
}
