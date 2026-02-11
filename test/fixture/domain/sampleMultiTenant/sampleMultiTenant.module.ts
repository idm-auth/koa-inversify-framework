import { Container } from 'inversify';
import { AbstractModule } from '@/abstract';
import { SampleMultiTenantController, SampleMultiTenantControllerSymbol } from './sampleMultiTenant.controller';
import { SampleMultiTenantService, SampleMultiTenantServiceSymbol } from './sampleMultiTenant.service';
import { SampleMultiTenantRepository, SampleMultiTenantRepositorySymbol } from './sampleMultiTenant.repository';
import { SampleMultiTenantMapper, SampleMultiTenantMapperSymbol } from './sampleMultiTenant.mapper';

export class SampleMultiTenantModule extends AbstractModule {
  protected runBind(): void {
    this.container.bind(SampleMultiTenantRepositorySymbol).to(SampleMultiTenantRepository).inSingletonScope();
    this.container.bind(SampleMultiTenantMapperSymbol).to(SampleMultiTenantMapper).inSingletonScope();
    this.container.bind(SampleMultiTenantServiceSymbol).to(SampleMultiTenantService).inSingletonScope();
    this.container.bind(SampleMultiTenantControllerSymbol).to(SampleMultiTenantController).inSingletonScope();
  }

  getControllerSymbol(): symbol {
    return SampleMultiTenantControllerSymbol;
  }
}
