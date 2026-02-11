import { AbstractModule } from '@/abstract';
import { Container } from 'inversify';
import { RealmRepository, RealmRepositorySymbol } from './realm.repository';
import { RealmService, RealmServiceSymbol } from './realm.service';

export class RealmModule extends AbstractModule {
  protected runBind(): void {
    this.container.bind(RealmRepositorySymbol).to(RealmRepository);
    this.container.bind(RealmServiceSymbol).to(RealmService);
  }

  getControllerSymbol(): null {
    return null;
  }
}
