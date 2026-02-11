import {
  SampleMultiTenantRepository,
  SampleMultiTenantRepositorySymbol,
} from '@test/fixture/domain/sampleMultiTenant/sampleMultiTenant.repository';
import { setupShared as baseSetupShared, teardownShared, getContext as baseGetContext, createTestRealm, deleteTestRealm } from '../setup';

let sharedRepository: SampleMultiTenantRepository;

export async function setupShared(): Promise<void> {
  await baseSetupShared();
  const ctx = baseGetContext();
  ctx.container.bind(SampleMultiTenantRepositorySymbol).to(SampleMultiTenantRepository);
  sharedRepository = ctx.container.get<SampleMultiTenantRepository>(SampleMultiTenantRepositorySymbol);
}

export function getContext() {
  return {
    ...baseGetContext(),
    repository: sharedRepository,
  };
}

export { teardownShared, createTestRealm, deleteTestRealm };
