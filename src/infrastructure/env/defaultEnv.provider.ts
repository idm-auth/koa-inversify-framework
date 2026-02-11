import { Configuration } from '@/stereotype/configuration.stereotype';
import { EnvKey } from '@/common/env.types';
import '@/infrastructure/env/dotenv.provider';

export interface EnvConstructor<T extends AbstractEnv = AbstractEnv> {
  new (...args: unknown[]): T;
}

export const EnvSymbol = Symbol.for('EnvFramework');

export abstract class AbstractEnv {
  protected defaults: Record<string, string> = {
    [EnvKey.PORT]: '3000',
    [EnvKey.NODE_ENV]: 'development',
    [EnvKey.MONGODB_URI]: 'mongodb://localhost:27017',
    [EnvKey.MONGODB_CORE_DBNAME]: 'idm-core-db',
    [EnvKey.LOGGER_LEVEL]: 'info',
    [EnvKey.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT]: 'http://jaeger:4318/v1/traces',
    [EnvKey.PROMETHEUS_PORT]: '9090',
    [EnvKey.APPLICATION_NAME]: 'koa-inversify-framework',
    [EnvKey.APPLICATION_VERSION]: '1.0.0',
    [EnvKey.SERVER_CONTEXT_PATH]: '/',
    [EnvKey.IDM_AUTH_SERVICE_URL]: 'https://idm-auth.io/api',
    [EnvKey.IDM_AUTH_APPLICATION_REALM_PUBLIC_UUID]: 'UNDEFINED',
  };

  private memCache: Record<string, string> = {};

  setMemValue(key: string, value: string): void {
    this.memCache[key] = value;
  }

  clearMemCache(): void {
    this.memCache = {};
  }

  get(key: string): string {
    const value = this.memCache[key];
    if (!value) {
      this.memCache[key] = process.env[key] || this.defaults[key];
      return this.memCache[key];
    }
    return value;
  }
}

@Configuration(EnvSymbol)
export class DefaultEnv extends AbstractEnv {}
