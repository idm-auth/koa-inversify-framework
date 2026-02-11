import { FrameworkTestHelper } from '@test/helpers/frameworkTestHelper';
import { SampleSingleTenantModule } from '@test/fixture/domain/sampleSingleTenant/sampleSingleTenant.module';
import { RealmEntity } from '@test/fixture/domain/realm/realm.entity';
import {
  SampleSingleTenantService,
  SampleSingleTenantServiceSymbol,
} from '@test/fixture/domain/sampleSingleTenant/sampleSingleTenant.service';
import { ExecutionContextProvider, ExecutionContextSymbol } from '@/infrastructure/context/executionContext.provider';
import { SampleSingleTenantEntity } from '@test/fixture/domain/sampleSingleTenant/sampleSingleTenant.entity';
import { SampleSingleTenantCreate } from '@test/fixture/domain/sampleSingleTenant/sampleSingleTenant.dto';
import { v4 as uuidv4 } from 'uuid';

export class SampleSingleTenantFrameworkHelper extends FrameworkTestHelper {
  private realm!: RealmEntity;

  constructor(private testName: string) {
    super();
  }

  async init(): Promise<void> {
    await super.init();
    this.realm = await this.setupTestRealm(
      `integration-samplesingletenant-${this.testName}`,
      false
    );
    new SampleSingleTenantModule(this.getContainer());
  }

  async shutdown(): Promise<void> {
    await this.deleteRealms([this.realm]);
    await super.shutdown();
  }

  getService(): SampleSingleTenantService {
    return this.getContainer().get<SampleSingleTenantService>(
      SampleSingleTenantServiceSymbol
    );
  }

  async createWithContext(data: SampleSingleTenantCreate): Promise<SampleSingleTenantEntity> {
    const executionContext = this.getContainer().get<ExecutionContextProvider>(ExecutionContextSymbol);
    let created: SampleSingleTenantEntity;
    await executionContext.init({ globalTransactionId: uuidv4(), tenantId: null }, async () => {
      created = await this.getService().create(data);
    });
    return created!;
  }
}
