/**
 * IMPORTANT: AbstractEnv and AbstractTenantResolver are exported from this single location
 * to prevent TypeScript module resolution issues with protected properties and decorators.
 *
 * When these types are exported from multiple paths (e.g., src/abstract/ and dist/abstract/),
 * TypeScript treats them as different types, causing structural comparison failures with
 * protected members. By centralizing exports here, we ensure a single source of truth.
 */
import { RuntimeConfigurationError } from '@/error/runtimeConfiguration.error';
import {
  BaseExecutionContext,
  ExecutionContextConstructor,
  ExecutionContextProvider,
  ExecutionContextSymbol,
} from '@/infrastructure/context/executionContext.provider';
import {
  AbstractEnv,
  DefaultEnv,
  EnvConstructor,
  EnvSymbol,
} from '@/infrastructure/env/defaultEnv.provider';
import {
  AbstractTenantResolver,
  DefaultTenantResolver,
  TenantResolverConstructor,
  TenantResolverSymbol,
} from '@/infrastructure/tenant/defaultTenantResolver.provider';

import { IdmClient, IdmClientSymbol } from '@/infrastructure/idm-client';
import { setGlobalContainer } from '@/infrastructure/inversify/container.provider';
import { DefaultErrorHandler } from '@/infrastructure/koa/defaultErrorHandler';
import {
  KoaServer,
  KoaServerSymbol,
} from '@/infrastructure/koa/koaServer.provider';
import { AbstractErrorHandler } from '@/infrastructure/koa/middleware/errorHandler.middleware';
import {
  RegisterRouter,
  RegisterRouterSymbol,
} from '@/infrastructure/koa/registerRouter.provider';
import {
  LoggerProvider,
  LoggerSymbol,
} from '@/infrastructure/logger/logger.provider';
import {
  MongoDB,
  MongoDBSymbol,
} from '@/infrastructure/mongodb/mongodb.provider';
import {
  OpenApiRegistryProvider,
  OpenApiRegistrySymbol,
  Swagger,
  SwaggerSymbol,
} from '@/infrastructure/swagger';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Container } from 'inversify';
import 'reflect-metadata';
import { TelemetrySymbol } from './telemetry';

/**
 * Framework initialization class with granular init methods for testing.
 *
 * Initialization order:
 * 1. initCore() - Base infrastructure (Env, Logger, ExecutionContext, TenantResolver)
 * 2. initDB() - Database (MongoDB)
 * 3. initKoa() - Web server (OpenAPI, Swagger, Router, Telemetry, Koa)
 *
 * Usage:
 *
 * Production (full init):
 *   await framework.init(); // Calls initCore + initDB + initKoa
 *
 * Unit tests (core only):
 *   await framework.initCore(container);
 *
 * Repository tests (core + DB):
 *   await framework.initCore(container);
 *   await framework.initDB(container);
 *
 * Integration tests (full):
 *   await framework.init();
 */

export class Framework {
  private container?: Container;
  private registry?: OpenAPIRegistry;
  private errorHandler?: AbstractErrorHandler;
  private executionContextClass?: ExecutionContextConstructor;
  private customExecutionContextSymbol?: symbol;
  private tenantResolverClass?: TenantResolverConstructor;
  private customTenantResolverSymbol?: symbol;
  private envClass?: EnvConstructor;
  private customEnvSymbol?: symbol;
  private loggerProvider?: LoggerProvider;
  private mongodb?: MongoDB;
  private koaServer?: KoaServer;
  private executionContext?: ExecutionContextProvider<BaseExecutionContext>;
  private telemetrySdk?: NodeSDK;

  setContainer(container: Container): this {
    if (!container) {
      throw new RuntimeConfigurationError(
        'Container cannot be null or undefined'
      );
    }
    this.container = container;
    return this;
  }

  setRegistry(registry: OpenAPIRegistry): this {
    if (!registry) {
      throw new RuntimeConfigurationError(
        'Registry cannot be null or undefined'
      );
    }
    this.registry = registry;
    return this;
  }

  setErrorHandler(errorHandler: AbstractErrorHandler): this {
    if (!errorHandler) {
      throw new RuntimeConfigurationError(
        'ErrorHandler cannot be null or undefined'
      );
    }
    this.errorHandler = errorHandler;
    return this;
  }

  setExecutionContext<T extends BaseExecutionContext>(
    contextClass: ExecutionContextConstructor<T>,
    customSymbol?: symbol
  ): this {
    if (!contextClass) {
      throw new RuntimeConfigurationError(
        'ExecutionContext class cannot be null or undefined'
      );
    }
    this.executionContextClass = contextClass;
    this.customExecutionContextSymbol = customSymbol;
    return this;
  }

  setTenantResolver<T extends AbstractTenantResolver>(
    tenantResolverClass: TenantResolverConstructor<T>,
    customSymbol?: symbol
  ): this {
    if (!tenantResolverClass) {
      throw new RuntimeConfigurationError(
        'TenantResolver class cannot be null or undefined'
      );
    }
    this.tenantResolverClass = tenantResolverClass;
    this.customTenantResolverSymbol = customSymbol;
    return this;
  }

  setEnv<T extends AbstractEnv>(
    envClass: EnvConstructor<T>,
    customSymbol?: symbol
  ): this {
    if (!envClass) {
      throw new RuntimeConfigurationError(
        'Env class cannot be null or undefined'
      );
    }
    this.envClass = envClass;
    this.customEnvSymbol = customSymbol;
    return this;
  }

  setNodeSDK(sdk: NodeSDK): this {
    if (!sdk) {
      throw new RuntimeConfigurationError(
        'NodeSDK cannot be null or undefined'
      );
    }
    this.telemetrySdk = sdk;
    return this;
  }

  getNodeSDK(): NodeSDK | undefined {
    return this.telemetrySdk;
  }

  /**
   * Initialize core infrastructure.
   * Registers: Env, Logger, ExecutionContext, TenantResolver
   * Use for: Unit tests that don't need DB or HTTP
   */
  async initCore(container: Container): Promise<void> {
    if (!this.container) {
      if (!container) {
        throw new RuntimeConfigurationError(
          'Container cannot be null or undefined'
        );
      } else {
        this.container = container;
      }
    }

    setGlobalContainer(container);

    const ContainerSymbol = Symbol.for('Container');
    if (!container.isBound(ContainerSymbol)) {
      container.bind(ContainerSymbol).toDynamicValue(() => container);
    }

    // Skip if already bound (idempotent)
    if (container.isBound(EnvSymbol)) {
      this.loggerProvider = container.get<LoggerProvider>(LoggerSymbol);
      this.executionContext = container.get<
        ExecutionContextProvider<BaseExecutionContext>
      >(ExecutionContextSymbol);
      return;
    }

    if (this.envClass) {
      container.bind(EnvSymbol).to(this.envClass).inSingletonScope();
      if (this.customEnvSymbol) {
        container.bind(this.customEnvSymbol).toService(EnvSymbol);
      }
    } else {
      container.bind(EnvSymbol).to(DefaultEnv).inSingletonScope();
    }
    container.bind(LoggerSymbol).to(LoggerProvider).inSingletonScope();
    if (this.telemetrySdk) {
      container.bind(TelemetrySymbol).toConstantValue(this.telemetrySdk);
    }
    container.bind(IdmClientSymbol).to(IdmClient).inSingletonScope();

    if (this.executionContextClass) {
      container
        .bind(ExecutionContextSymbol)
        .to(this.executionContextClass)
        .inSingletonScope();
      if (this.customExecutionContextSymbol) {
        container
          .bind(this.customExecutionContextSymbol)
          .toService(ExecutionContextSymbol);
      }
    } else {
      container
        .bind(ExecutionContextSymbol)
        .to(ExecutionContextProvider)
        .inSingletonScope();
    }

    if (this.tenantResolverClass) {
      container
        .bind(TenantResolverSymbol)
        .to(this.tenantResolverClass)
        .inSingletonScope();
      if (this.customTenantResolverSymbol) {
        container
          .bind(this.customTenantResolverSymbol)
          .toService(TenantResolverSymbol);
      }
    } else {
      container
        .bind(TenantResolverSymbol)
        .to(DefaultTenantResolver)
        .inSingletonScope();
    }

    this.loggerProvider = container.get<LoggerProvider>(LoggerSymbol);
    this.executionContext = container.get<
      ExecutionContextProvider<BaseExecutionContext>
    >(ExecutionContextSymbol);
  }

  /**
   * Initialize database.
   * Registers: MongoDB
   * Use for: Repository tests
   * Requires: initCore() called first
   */
  async initDB(container: Container): Promise<void> {
    if (!this.loggerProvider) {
      throw new RuntimeConfigurationError(
        'initCore() must be called before initDB()'
      );
    }

    container.bind(MongoDBSymbol).to(MongoDB).inSingletonScope();

    this.mongodb = container.get<MongoDB>(MongoDBSymbol);
    await this.mongodb.init();
  }

  /**
   * Initialize web server.
   * Registers: OpenAPI, Swagger, Router, Telemetry, Koa
   * Use for: Integration tests
   * Requires: initCore() called first, setRegistry() called
   */
  async initKoa(container: Container): Promise<void> {
    if (!this.loggerProvider) {
      throw new RuntimeConfigurationError(
        'initCore() must be called before initKoa()'
      );
    }
    if (!this.registry) {
      throw new RuntimeConfigurationError(
        'Registry not set. Call setRegistry() before initKoa()'
      );
    }
    if (!this.errorHandler) {
      this.loggerProvider
        .getLogger()
        .warn('No custom error handler set. Using DefaultErrorHandler');
      this.errorHandler = new DefaultErrorHandler(container);
    }

    const registryProvider = new OpenApiRegistryProvider(this.registry);
    container.bind(OpenApiRegistrySymbol).toConstantValue(registryProvider);

    container.bind(SwaggerSymbol).to(Swagger).inSingletonScope();
    container.bind(RegisterRouterSymbol).to(RegisterRouter).inSingletonScope();
    container.bind(KoaServerSymbol).to(KoaServer).inSingletonScope();

    this.koaServer = container.get<KoaServer>(KoaServerSymbol);

    this.koaServer.setErrorHandler(this.errorHandler);

    await this.koaServer.init(container);
  }

  /**
   * Full initialization (production).
   * Calls: initCore() + initDB() + initKoa()
   * Requires: setContainer() and setRegistry() called
   */
  async init(): Promise<void> {
    if (!this.container)
      throw new RuntimeConfigurationError(
        'Container not set. Call setContainer() before init()'
      );
    if (!this.registry)
      throw new RuntimeConfigurationError(
        'Registry not set. Call setRegistry() before init()'
      );

    await this.initCore(this.container);
    await this.initDB(this.container);
    await this.initKoa(this.container);
  }

  reconfigureLogger(): void {
    if (!this.loggerProvider)
      throw new RuntimeConfigurationError('Framework not initialized');
    this.loggerProvider.reconfigure();
  }

  async listen(): Promise<void> {
    if (!this.koaServer)
      throw new RuntimeConfigurationError('Framework not initialized');
    await this.koaServer.listen();
  }

  async shutdownKoa(): Promise<void> {
    if (this.koaServer) await this.koaServer.shutdown();
  }

  async shutdownDB(): Promise<void> {
    if (this.mongodb) await this.mongodb.shutdown();
    if (this.loggerProvider) this.loggerProvider.flush();
  }

  async shutdown(): Promise<void> {
    await this.shutdownKoa();
    await this.shutdownDB();
  }

  getKoaServer(): KoaServer {
    if (!this.koaServer)
      throw new RuntimeConfigurationError('koaServer not init. Call init()');
    return this.koaServer;
  }
}

/**
 * Export AbstractEnv and AbstractTenantResolver from this single location.
 * These must be exported only from here to prevent TypeScript from treating
 * them as different types when resolved from multiple module paths.
 */
export {
  AbstractEnv,
  AbstractTenantResolver,
  EnvConstructor,
  EnvSymbol,
  TenantResolverConstructor,
  TenantResolverSymbol,
};
