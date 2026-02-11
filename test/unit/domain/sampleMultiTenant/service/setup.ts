import {
  SampleMultiTenantService,
  SampleMultiTenantServiceSymbol,
} from '@test/fixture/domain/sampleMultiTenant/sampleMultiTenant.service';
import {
  SampleMultiTenantRepository,
  SampleMultiTenantRepositorySymbol,
} from '@test/fixture/domain/sampleMultiTenant/sampleMultiTenant.repository';
import {
  SampleMultiTenantMapper,
  SampleMultiTenantMapperSymbol,
} from '@test/fixture/domain/sampleMultiTenant/sampleMultiTenant.mapper';
import {
  setupShared as baseSetupShared,
  teardownShared,
  getContext as baseGetContext,
  createTestRealm,
  deleteTestRealm,
} from '../setup';

let sharedService: SampleMultiTenantService;

export async function setupShared(): Promise<void> {
  await baseSetupShared();
  const ctx = baseGetContext();
  ctx.container
    .bind(SampleMultiTenantRepositorySymbol)
    .to(SampleMultiTenantRepository);
  ctx.container
    .bind(SampleMultiTenantServiceSymbol)
    .to(SampleMultiTenantService);
  sharedService = ctx.container.get<SampleMultiTenantService>(
    SampleMultiTenantServiceSymbol
  );
}

export function getContext() {
  return {
    ...baseGetContext(),
    service: sharedService,
  };
}

export { teardownShared, createTestRealm, deleteTestRealm };
