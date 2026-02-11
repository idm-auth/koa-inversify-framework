import {
  SampleSingleTenantRepository,
  SampleSingleTenantRepositorySymbol,
} from '@test/fixture/domain/sampleSingleTenant/sampleSingleTenant.repository';
import { setupShared as baseSetupShared, teardownShared, getContext as baseGetContext, createTestRealm, deleteTestRealm } from '../setup';

let sharedRepository: SampleSingleTenantRepository;

export async function setupShared(): Promise<void> {
  await baseSetupShared();
  const ctx = baseGetContext();
  ctx.container.bind(SampleSingleTenantRepositorySymbol).to(SampleSingleTenantRepository);
  sharedRepository = ctx.container.get<SampleSingleTenantRepository>(SampleSingleTenantRepositorySymbol);
}

export function getContext() {
  return {
    ...baseGetContext(),
    repository: sharedRepository,
  };
}

export { teardownShared, createTestRealm, deleteTestRealm };
