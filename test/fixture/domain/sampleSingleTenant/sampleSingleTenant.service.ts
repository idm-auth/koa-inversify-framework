import { AbstractCrudService } from '@/abstract';
import { PaginationFilter } from '@/common/pagination.model';
import { Service } from '@/stereotype';
import { inject } from 'inversify';
import {
  SampleSingleTenantCreate,
  SampleSingleTenantEntity,
  SampleSingleTenantSchema,
} from './sampleSingleTenant.entity';
import {
  SampleSingleTenantRepository,
  SampleSingleTenantRepositorySymbol,
} from './sampleSingleTenant.repository';
import { SampleSingleTenantDtoTypes } from './sampleSingleTenant.dto';

export const SampleSingleTenantServiceSymbol = Symbol.for(
  'SampleSingleTenantService'
);

@Service(SampleSingleTenantServiceSymbol)
export class SampleSingleTenantService extends AbstractCrudService<
  SampleSingleTenantSchema,
  SampleSingleTenantDtoTypes,
  SampleSingleTenantCreate
> {
  @inject(SampleSingleTenantRepositorySymbol)
  protected repository!: SampleSingleTenantRepository;

  protected buildCreateDataFromDto(
    dto: SampleSingleTenantDtoTypes['CreateRequestDto']
  ): SampleSingleTenantCreate {
    return {
      name: dto.name,
      email: dto.email,
    };
  }

  protected buildUpdate(
    entity: SampleSingleTenantEntity,
    dto: SampleSingleTenantDtoTypes['UpdateRequestDto']
  ): SampleSingleTenantEntity {
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;
    return entity;
  }

  protected buildPaginationFilter(filter?: PaginationFilter) {
    return filter || {};
  }

  async findByEmail(email: string) {
    return this.repository.findByEmail(email);
  }
}
