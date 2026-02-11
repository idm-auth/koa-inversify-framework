export class ExecutionContextNotInitializedError extends Error {
  constructor() {
    super('ExecutionContext not initialized. Call executionContext.init() before using repository.');
    this.name = 'ExecutionContextNotInitializedError';
  }
}
