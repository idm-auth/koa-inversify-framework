import { Container } from 'inversify';
import { AbstractModule } from '@/abstract';
import { SampleSingleTenantController, SampleSingleTenantControllerSymbol } from './sampleSingleTenant.controller';
import { SampleSingleTenantService, SampleSingleTenantServiceSymbol } from './sampleSingleTenant.service';
import { SampleSingleTenantRepository, SampleSingleTenantRepositorySymbol } from './sampleSingleTenant.repository';
import { SampleSingleTenantMapper, SampleSingleTenantMapperSymbol } from './sampleSingleTenant.mapper';

export class SampleSingleTenantModule extends AbstractModule {
  protected runBind(): void {
    this.container.bind(SampleSingleTenantRepositorySymbol).to(SampleSingleTenantRepository).inSingletonScope();
    this.container.bind(SampleSingleTenantMapperSymbol).to(SampleSingleTenantMapper).inSingletonScope();
    this.container.bind(SampleSingleTenantServiceSymbol).to(SampleSingleTenantService).inSingletonScope();
    this.container.bind(SampleSingleTenantControllerSymbol).to(SampleSingleTenantController).inSingletonScope();
  }

  getControllerSymbol(): symbol {
    return SampleSingleTenantControllerSymbol;
  }
}
