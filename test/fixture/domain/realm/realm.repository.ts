import { AbstractCrudMongoRepository } from '@/abstract';
import { Repository } from '@/stereotype';
import { RealmSchema, realmSchema, RealmEntity } from './realm.entity';

export const RealmRepositorySymbol = Symbol.for('RealmRepository');

@Repository(RealmRepositorySymbol, { multiTenant: false })
export class RealmRepository extends AbstractCrudMongoRepository<RealmSchema> {
  constructor() {
    super(realmSchema, 'realms');
  }
}
