import { Container } from 'inversify';
import { LoggerProvider, LoggerSymbol } from '@/infrastructure/logger/logger.provider';
import { DefaultEnv } from '@/infrastructure/env/defaultEnv.provider';
import { EnvSymbol } from '@/index';

export function createTestContainer(): Container {
  const container = new Container();
  container.bind(EnvSymbol).to(DefaultEnv).inSingletonScope();
  container.bind(LoggerSymbol).to(LoggerProvider).inSingletonScope();
  return container;
}
