import { AbstractCrudMongoRepository } from '@/abstract';
import { Repository } from '@/stereotype';
import { SampleMultiTenantSchema, sampleMultiTenantSchema, SampleMultiTenantEntity } from './sampleMultiTenant.entity';

export const SampleMultiTenantRepositorySymbol = Symbol.for('SampleMultiTenantRepository');

@Repository(SampleMultiTenantRepositorySymbol, { multiTenant: true })
export class SampleMultiTenantRepository extends AbstractCrudMongoRepository<SampleMultiTenantSchema> {
  constructor() {
    super(sampleMultiTenantSchema, 'samplesMultiTenant');
  }

  async findByEmail(email: string): Promise<SampleMultiTenantEntity> {
    return this.findOne({ email });
  }
}
