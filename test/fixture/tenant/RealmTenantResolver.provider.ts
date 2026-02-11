import { AbstractTenantResolver, TenantResolverSymbol } from '@/index';
import { Configuration } from '@/stereotype/configuration.stereotype';
import {
  RealmService,
  RealmServiceSymbol,
} from '../domain/realm/realm.service';
import { inject, Container } from 'inversify';
import { ContainerSymbol } from '@/infrastructure/core/core.interface';

export const RealmTenantResolverSymbol = Symbol.for('RealmTenantResolver');

@Configuration(RealmTenantResolverSymbol)
export class RealmTenantResolver extends AbstractTenantResolver {
  @inject(ContainerSymbol)
  private container!: Container;

  async resolveTenantDbName(tenantId: string): Promise<string> {
    this.logger.debug(
      { tenantId },
      '[RealmTenantResolver.resolveTenantDbName] Starting'
    );
    const realmService = this.container.get<RealmService>(RealmServiceSymbol);
    this.logger.debug(
      { tenantId },
      '[RealmTenantResolver.resolveTenantDbName] Calling findByPublicUUID'
    );
    const realm = await realmService.findByPublicUUID(tenantId);
    this.logger.debug(
      { tenantId, dbName: realm.dbName },
      '[RealmTenantResolver.resolveTenantDbName] Realm lookup complete'
    );
    return realm.dbName;
  }

  async getTenantCorePublicUUID(): Promise<string> {
    const realmService = this.container.get<RealmService>(RealmServiceSymbol);
    const realm = await realmService.getRealmCore();
    return realm.publicUUID;
  }
}
