import { AbstractCrudService } from '@/abstract';
import { PaginationFilter } from '@/common/pagination.model';
import { EnvKey } from '@/common/env.types';
import { AbstractEnv, EnvSymbol } from '@/index';
import { Service } from '@/stereotype';
import { inject } from 'inversify';
import { RealmDtoTypes } from './realm.dto';
import { RealmCreate, RealmEntity, RealmSchema } from './realm.entity';
import { RealmRepository, RealmRepositorySymbol } from './realm.repository';

export const RealmServiceSymbol = Symbol.for('RealmService');

export const RealmLookupSymbol = Symbol.for('RealmLookup');
export interface RealmLookup {
  findByPublicUUID(tenantId: string): Promise<{ dbName: string }>;
}

@Service(RealmServiceSymbol, { multiTenant: false })
export class RealmService
  extends AbstractCrudService<RealmSchema, RealmDtoTypes, RealmCreate>
  implements RealmLookup
{
  @inject(RealmRepositorySymbol) protected repository!: RealmRepository;
  @inject(EnvSymbol) private env!: AbstractEnv;

  protected buildCreateDataFromDto(
    dto: RealmDtoTypes['CreateRequestDto']
  ): RealmCreate {
    return {
      name: dto.name,
      dbName: dto.dbName,
    };
  }

  protected buildUpdate(
    entity: RealmEntity,
    dto: RealmDtoTypes['UpdateRequestDto']
  ): RealmEntity {
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.dbName !== undefined) entity.dbName = dto.dbName;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;
    return entity;
  }

  protected buildPaginationFilter(filter?: PaginationFilter) {
    return filter || {};
  }

  async findByPublicUUID(publicUUID: string) {
    return this.repository.findOne({ publicUUID: publicUUID });
  }

  async getRealmCore() {
    return this.repository.findOne({
      dbName: this.env.get(EnvKey.MONGODB_CORE_DBNAME),
    });
  }
}
