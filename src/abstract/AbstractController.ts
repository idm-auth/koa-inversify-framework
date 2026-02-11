import { AbstractBase } from '@/abstract/AbstractBase';
import {
  ExecutionContextProvider,
  ExecutionContextSymbol,
} from '@/infrastructure/context/executionContext.provider';
import { MultiTenantConfigurationError } from '@/error/multiTenantConfigurationError';
import {
  getControllerOptions,
  ControllerOptions,
} from '@/stereotype/controller.stereotype';
import { inject } from 'inversify';
import { Context } from 'koa';

/**
 * AbstractController - Base class for all controllers
 * 
 * Provides controller-specific infrastructure:
 * - ExecutionContext access
 * - Multi-tenant validation
 * - Controller options
 * 
 * Extended by:
 * - AbstractCrudController (for CRUD operations)
 * - Custom controllers (for non-CRUD operations)
 */
export abstract class AbstractController extends AbstractBase {
  @inject(ExecutionContextSymbol)
  protected executionContext!: ExecutionContextProvider;

  protected getOptions(): ControllerOptions | undefined {
    return getControllerOptions(this.constructor);
  }

  protected validateMultiTenantSetup(
    ctx: Context & { params?: { tenantId?: string } }
  ): void {
    const options = this.getOptions();

    if (options?.multiTenant) {
      const tenantId = ctx.params?.tenantId;

      if (!tenantId) {
        this.log.error(
          'Multi-tenant controller missing tenantId in route params'
        );
        throw new MultiTenantConfigurationError(this.constructor.name);
      }
    }
  }
}
