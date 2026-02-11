import { AbstractCrudMongoRepository } from '@/abstract';
import { Repository } from '@/stereotype';
import {
  SampleSingleTenantSchema,
  sampleSingleTenantSchema,
  SampleSingleTenantEntity,
} from './sampleSingleTenant.entity';

export const SampleSingleTenantRepositorySymbol = Symbol.for(
  'SampleSingleTenantRepository'
);

@Repository(SampleSingleTenantRepositorySymbol)
export class SampleSingleTenantRepository extends AbstractCrudMongoRepository<SampleSingleTenantSchema> {
  constructor() {
    super(sampleSingleTenantSchema, 'samplesSingleTenant');
  }

  async findByEmail(email: string): Promise<SampleSingleTenantEntity> {
    return this.findOne({ email });
  }
}
