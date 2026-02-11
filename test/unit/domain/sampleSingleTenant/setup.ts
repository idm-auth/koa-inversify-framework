import { ExecutionContextProvider, ExecutionContextSymbol } from '@/infrastructure';
import { FrameworkTestHelper } from '@test/helpers/frameworkTestHelper';
import { RealmEntity } from '@test/fixture/domain/realm/realm.entity';
import { Container } from 'inversify';

export interface TestContext {
  helper: FrameworkTestHelper;
  container: Container;
  executionContext: ExecutionContextProvider;
}

let sharedHelper: FrameworkTestHelper;
let sharedExecutionContext: ExecutionContextProvider;

export async function setupShared(): Promise<void> {
  sharedHelper = new FrameworkTestHelper();
  await sharedHelper.initCore();
  await sharedHelper.initDB();

  sharedExecutionContext = sharedHelper.getContainer().get<ExecutionContextProvider>(ExecutionContextSymbol);
}

export async function teardownShared(): Promise<void> {
  await sharedHelper.shutdownDB();
}

export function getContext(): TestContext {
  return {
    helper: sharedHelper,
    container: sharedHelper.getContainer(),
    executionContext: sharedExecutionContext,
  };
}

export async function createTestRealm(name: string): Promise<RealmEntity> {
  return await sharedHelper.setupTestRealm(name, false);
}

export async function deleteTestRealm(realm: RealmEntity): Promise<void> {
  await sharedHelper.deleteRealms([realm]);
}
