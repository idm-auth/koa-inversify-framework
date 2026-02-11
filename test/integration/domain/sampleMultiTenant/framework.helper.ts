import { FrameworkTestHelper } from '@test/helpers/frameworkTestHelper';
import { SampleMultiTenantModule } from '@test/fixture/domain/sampleMultiTenant/sampleMultiTenant.module';
import { RealmEntity } from '@test/fixture/domain/realm/realm.entity';
import {
  SampleMultiTenantService,
  SampleMultiTenantServiceSymbol,
} from '@test/fixture/domain/sampleMultiTenant/sampleMultiTenant.service';
import { ExecutionContextProvider, ExecutionContextSymbol } from '@/infrastructure/context/executionContext.provider';
import { SampleMultiTenantEntity } from '@test/fixture/domain/sampleMultiTenant/sampleMultiTenant.entity';
import { SampleMultiTenantCreate } from '@test/fixture/domain/sampleMultiTenant/sampleMultiTenant.dto';
import { v4 as uuidv4 } from 'uuid';

export class SampleMultiTenantFrameworkHelper extends FrameworkTestHelper {
  private realm!: RealmEntity;

  constructor(private testName: string) {
    super();
  }

  async init(): Promise<void> {
    await super.init();

    this.realm = await this.setupTestRealm(
      `integration-samplemultitenant-${this.testName}`,
      true
    );
    new SampleMultiTenantModule(this.getContainer());
  }

  async shutdown(): Promise<void> {
    await this.deleteRealms([this.realm]);
    await super.shutdown();
  }

  getRealm(): RealmEntity {
    return this.realm;
  }

  getService(): SampleMultiTenantService {
    return this.getContainer().get<SampleMultiTenantService>(
      SampleMultiTenantServiceSymbol
    );
  }

  async createWithContext(data: SampleMultiTenantCreate): Promise<SampleMultiTenantEntity> {
    const executionContext = this.getContainer().get<ExecutionContextProvider>(ExecutionContextSymbol);
    let created: SampleMultiTenantEntity;
    await executionContext.init({ globalTransactionId: uuidv4(), tenantId: this.realm.publicUUID }, async () => {
      created = await this.getService().create(data);
    });
    return created!;
  }
}
