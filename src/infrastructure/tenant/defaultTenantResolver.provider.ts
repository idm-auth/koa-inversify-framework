import { TenantResolverNotConfiguredError } from '@/error/tenantResolverNotConfigured.error';
import { Configuration } from '@/stereotype';
import {
  ExecutionContextProvider,
  ExecutionContextSymbol,
} from '@/infrastructure/context/executionContext.provider';
import {
  LoggerProvider,
  LoggerSymbol,
} from '@/infrastructure/logger/logger.provider';
import { inject } from 'inversify';

export interface TenantResolverConstructor<
  T extends AbstractTenantResolver = AbstractTenantResolver,
> {
  new (...args: unknown[]): T;
}

export const TenantResolverSymbol = Symbol.for('TenantResolver');

export abstract class AbstractTenantResolver {
  @inject(ExecutionContextSymbol)
  protected executionContext!: ExecutionContextProvider;

  @inject(LoggerSymbol)
  protected loggerProvider!: LoggerProvider;

  protected get logger() {
    return this.loggerProvider.getLogger();
  }

  abstract resolveTenantDbName(tenantId: string): Promise<string>;
  abstract getTenantCorePublicUUID(): Promise<string>;

  async getDbName(): Promise<string> {
    this.logger.debug('[TenantResolver.getDbName] Starting');
    const tenantId = this.executionContext.getTenantId();
    this.logger.debug(
      { tenantId },
      '[TenantResolver.getDbName] TenantId from context'
    );
    if (!tenantId) {
      throw new Error('No tenant context available');
    }

    this.logger.debug(
      { tenantId },
      '[TenantResolver.getDbName] Calling resolveTenantDbName'
    );
    const dbName = await this.resolveTenantDbName(tenantId);
    this.logger.debug(
      { tenantId, dbName },
      '[TenantResolver.getDbName] DbName resolved'
    );

    return dbName;
  }
}

@Configuration(TenantResolverSymbol)
export class DefaultTenantResolver extends AbstractTenantResolver {
  async resolveTenantDbName(tenantId: string): Promise<string> {
    const err = new TenantResolverNotConfiguredError(tenantId);
    this.logger.error(
      { tenantId, err },
      'DefaultTenantResolver.resolveTenantDbName called - TenantResolver not configured'
    );
    throw err;
  }

  async getTenantCorePublicUUID(): Promise<string> {
    const err = new TenantResolverNotConfiguredError('core');
    this.logger.error(
      { err },
      'DefaultTenantResolver.getTenantCorePublicUUID called - TenantResolver not configured'
    );
    throw err;
  }
}
