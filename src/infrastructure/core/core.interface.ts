import type { Container } from 'inversify';

export const ContainerSymbol = Symbol.for('Container');

export interface ILifecycle {
  init(container: Container): Promise<void>;
  shutdown(): Promise<void>;
}


