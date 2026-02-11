import type { Container } from 'inversify';

let globalContainer: Container | undefined;

export function setGlobalContainer(container: Container): void {
  globalContainer = container;
}

export function getGlobalContainer(): Container {
  if (!globalContainer) {
    throw new Error('Container not initialized. Call Framework.init() first.');
  }
  return globalContainer;
}
