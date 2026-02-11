import { ExecutionContextProvider, ExecutionContextSymbol } from '@/infrastructure';
import { FrameworkTestHelper } from '@test/helpers/frameworkTestHelper';
import { RealmEntity } from '@test/fixture/domain/realm/realm.entity';
import { Container } from 'inversify';

export interface TestContext {
  helper: FrameworkTestHelper;
  container: Container;
  executionContext: ExecutionContextProvider;
}

let sharedHelper: FrameworkTestHelper | undefined;
let sharedExecutionContext: ExecutionContextProvider | undefined;

export async function setupShared(): Promise<void> {
  sharedHelper = new FrameworkTestHelper();
  await sharedHelper.initCore();
  await sharedHelper.initDB();

  sharedExecutionContext = sharedHelper.getContainer().get<ExecutionContextProvider>(ExecutionContextSymbol);
}

export async function teardownShared(): Promise<void> {
  if (!sharedHelper) return;
  await sharedHelper.shutdownDB();
}

export function getContext(): TestContext {
  if (!sharedHelper || !sharedExecutionContext) {
    throw new Error('Test context not initialized. Call setupShared() first.');
  }
  return {
    helper: sharedHelper,
    container: sharedHelper.getContainer(),
    executionContext: sharedExecutionContext,
  };
}

export async function createTestRealm(name: string): Promise<RealmEntity> {
  if (!sharedHelper) {
    throw new Error('Test context not initialized. Call setupShared() first.');
  }
  return await sharedHelper.setupTestRealm(name, true);
}

export async function deleteTestRealm(realm: RealmEntity): Promise<void> {
  if (!sharedHelper) {
    throw new Error('Test context not initialized. Call setupShared() first.');
  }
  await sharedHelper.deleteRealms([realm]);
}
