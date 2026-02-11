import { ILifecycle } from '@/infrastructure/core/core.interface';
import { AbstractEnv, EnvSymbol } from '@/index';
import { EnvKey } from '@/common/env.types';
import {
  Swagger,
  SwaggerSymbol,
} from '@/infrastructure/swagger/swagger.provider';
import { Configuration } from '@/stereotype/configuration.stereotype';
import { AbstractErrorHandler } from '@/infrastructure/koa/middleware/errorHandler.middleware';
import { DefaultErrorHandler } from '@/infrastructure/koa/defaultErrorHandler';
import {
  LoggerProvider,
  LoggerSymbol,
} from '@/infrastructure/logger/logger.provider';
import cors from '@koa/cors';
import Router from '@koa/router';
import { Container, inject } from 'inversify';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';

export const KoaServerSymbol = Symbol.for('KoaServer');

@Configuration(KoaServerSymbol)
export class KoaServer implements ILifecycle {
  private app: Koa;
  private router: InstanceType<typeof Router>;
  private server: ReturnType<Koa['listen']> | null = null;
  private errorHandler?: AbstractErrorHandler;

  constructor(
    @inject(EnvSymbol) private env: AbstractEnv,
    @inject(SwaggerSymbol) private swagger: Swagger,
    @inject(LoggerSymbol) private loggerProvider: LoggerProvider
  ) {
    this.app = new Koa();
    this.router = new Router();
  }

  setErrorHandler(errorHandler: AbstractErrorHandler): void {
    this.loggerProvider.getLogger().debug('KoaServer: Setting error handler');
    this.errorHandler = errorHandler;
  }

  async init(container: Container): Promise<void> {
    this.loggerProvider.getLogger().debug('KoaServer: Initializing');

    if (!this.errorHandler) {
      this.loggerProvider
        .getLogger()
        .warn('No custom error handler set. Using DefaultErrorHandler');
      this.errorHandler = new DefaultErrorHandler(container);
    }

    this.router.get('/', (ctx) => {
      ctx.body = { status: 'ok' };
    });

    this.swagger.setup(this.app);

    this.loggerProvider
      .getLogger()
      .debug('KoaServer: Registering error handler middleware');
    this.app.use(this.errorHandler.middleware());

    this.loggerProvider
      .getLogger()
      .debug('KoaServer: Registering helmet middleware');
    this.app.use(helmet());

    this.loggerProvider
      .getLogger()
      .debug('KoaServer: Registering cors middleware');
    this.app.use(cors());

    this.loggerProvider
      .getLogger()
      .debug('KoaServer: Registering bodyParser middleware');
    this.app.use(bodyParser());

    this.loggerProvider.getLogger().debug('KoaServer: Initialization complete');
  }

  getRouter(): InstanceType<typeof Router> {
    return this.router;
  }

  applyRouter(_container: Container): void {
    this.loggerProvider.getLogger().debug('KoaServer: Applying router');

    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
  }

  getApp(): Koa {
    return this.app;
  }

  async listen(): Promise<void> {
    const PORT = this.env.get(EnvKey.PORT);
    this.loggerProvider
      .getLogger()
      .debug({ port: PORT }, 'KoaServer: Starting to listen');
    this.server = this.app.listen(parseInt(PORT), () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

  async shutdown(): Promise<void> {
    this.loggerProvider.getLogger().debug('KoaServer: Shutting down');
    if (this.server) {
      await new Promise<void>((resolve) => this.server!.close(() => resolve()));
    }
  }
}
