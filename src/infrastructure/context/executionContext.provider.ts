import { AsyncLocalStorage } from 'node:async_hooks';
import { Configuration } from '@/stereotype/configuration.stereotype';

export interface BaseExecutionContext {
  globalTransactionId: string; // UUID for distributed tracing across all operations
  tenantId: string | null;
}

export const ExecutionContextSymbol = Symbol.for('ExecutionContext');

@Configuration(ExecutionContextSymbol)
export class ExecutionContextProvider<T extends BaseExecutionContext = BaseExecutionContext> {
  private storage = new AsyncLocalStorage<T>();

  init(context: T, callback: () => Promise<void>): Promise<void> {
    return this.storage.run(context, callback);
  }

  get(): T | undefined {
    return this.storage.getStore();
  }

  getTenantId(): string | null {
    const context = this.get();
    return context?.tenantId ?? null;
  }

  setTenantId(tenantId: string): void {
    const context = this.get();
    if (context) {
      context.tenantId = tenantId;
    }
  }
}

export type ExecutionContextConstructor<T extends BaseExecutionContext = BaseExecutionContext> = new (...args: never[]) => ExecutionContextProvider<T>;
