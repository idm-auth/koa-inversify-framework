import {
  SampleSingleTenantService,
  SampleSingleTenantServiceSymbol,
} from '@test/fixture/domain/sampleSingleTenant/sampleSingleTenant.service';
import {
  SampleSingleTenantRepository,
  SampleSingleTenantRepositorySymbol,
} from '@test/fixture/domain/sampleSingleTenant/sampleSingleTenant.repository';
import {
  SampleSingleTenantMapper,
  SampleSingleTenantMapperSymbol,
} from '@test/fixture/domain/sampleSingleTenant/sampleSingleTenant.mapper';
import {
  setupShared as baseSetupShared,
  teardownShared,
  getContext as baseGetContext,
  createTestRealm,
  deleteTestRealm,
} from '../setup';

let sharedService: SampleSingleTenantService;

export async function setupShared(): Promise<void> {
  await baseSetupShared();
  const ctx = baseGetContext();
  ctx.container
    .bind(SampleSingleTenantRepositorySymbol)
    .to(SampleSingleTenantRepository);
  ctx.container
    .bind(SampleSingleTenantServiceSymbol)
    .to(SampleSingleTenantService);
  sharedService = ctx.container.get<SampleSingleTenantService>(
    SampleSingleTenantServiceSymbol
  );
}

export function getContext() {
  return {
    ...baseGetContext(),
    service: sharedService,
  };
}

export { teardownShared, createTestRealm, deleteTestRealm };
