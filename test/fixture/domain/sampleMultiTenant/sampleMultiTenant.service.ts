import { AbstractCrudService } from '@/abstract';
import { PaginationFilter } from '@/common/pagination.model';
import { Service } from '@/stereotype';
import { inject } from 'inversify';
import { SampleMultiTenantDtoTypes } from './sampleMultiTenant.dto';
import {
  SampleMultiTenantCreate,
  SampleMultiTenantEntity,
  SampleMultiTenantSchema,
} from './sampleMultiTenant.entity';
import {
  SampleMultiTenantRepository,
  SampleMultiTenantRepositorySymbol,
} from './sampleMultiTenant.repository';

export const SampleMultiTenantServiceSymbol = Symbol.for(
  'SampleMultiTenantService'
);

@Service(SampleMultiTenantServiceSymbol, { multiTenant: true })
export class SampleMultiTenantService extends AbstractCrudService<
  SampleMultiTenantSchema,
  SampleMultiTenantDtoTypes,
  SampleMultiTenantCreate
> {
  @inject(SampleMultiTenantRepositorySymbol)
  protected repository!: SampleMultiTenantRepository;

  protected buildCreateDataFromDto(
    dto: SampleMultiTenantDtoTypes['CreateRequestDto']
  ): SampleMultiTenantCreate {
    this.log.debug({ dto }, 'Building create data');
    return {
      name: dto.name,
      email: dto.email,
    };
  }

  protected buildUpdate(
    entity: SampleMultiTenantEntity,
    dto: SampleMultiTenantDtoTypes['UpdateRequestDto']
  ): SampleMultiTenantEntity {
    this.log.debug({ id: entity._id, dto }, 'Building update');
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;
    return entity;
  }

  protected buildPaginationFilter(filter?: PaginationFilter) {
    return filter || {};
  }

  async findByEmail(email: string) {
    this.log.debug({ email }, 'Finding by email');
    return this.repository.findByEmail(email);
  }
}
