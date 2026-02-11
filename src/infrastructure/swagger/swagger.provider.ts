import { Configuration } from '@/stereotype/configuration.stereotype';
import { inject } from 'inversify';
import Koa from 'koa';
import Router from '@koa/router';
import mount from 'koa-mount';
import serve from 'koa-static';
import { absolutePath } from 'swagger-ui-dist';
import { readFileSync } from 'fs';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import {
  OpenApiRegistryProvider,
  OpenApiRegistrySymbol,
} from './openApiRegistry.provider';
import {
  LoggerProvider,
  LoggerSymbol,
} from '@/infrastructure/logger/logger.provider';

export const SwaggerSymbol = Symbol.for('Swagger');

@Configuration(SwaggerSymbol)
export class Swagger {
  constructor(
    @inject(OpenApiRegistrySymbol)
    private registryProvider: OpenApiRegistryProvider,
    @inject(LoggerSymbol) private loggerProvider: LoggerProvider
  ) {}

  private get logger() {
    return this.loggerProvider.getLogger();
  }

  setup(app: Koa): void {
    this.logger.info('Swagger UI available at /api-docs');
    this.logger.info('OpenAPI spec available at /api-docs/swagger.json');

    const router = new Router();

    router.get('/api-docs', async (ctx) => {
      ctx.type = 'text/html';
      ctx.body = readFileSync(absolutePath() + '/index.html', 'utf8')
        .replace('<head>', '<head>\n    <base href="/api-docs/">')
        .replace(
          '<title>Swagger UI</title>',
          '<title>API Documentation</title>'
        );
    });

    router.get('/api-docs/swagger-initializer.js', async (ctx) => {
      ctx.type = 'application/javascript';
      ctx.body = readFileSync(
        absolutePath() + '/swagger-initializer.js',
        'utf8'
      ).replace(
        'https://petstore.swagger.io/v2/swagger.json',
        '/api-docs/swagger.json'
      );
    });

    router.get('/api-docs/swagger.json', async (ctx) => {
      const registry = this.registryProvider.getRegistry();
      const generator = new OpenApiGeneratorV3(registry.definitions);

      const document = generator.generateDocument({
        openapi: '3.0.0',
        info: {
          title: 'API Documentation',
          version: '1.0.0',
          description: 'Generated API documentation',
        },
        servers: [
          {
            url: '',
            description: 'Development server',
          },
        ],
      });

      ctx.type = 'application/json';
      ctx.body = document;
    });

    app.use(router.routes());
    app.use(router.allowedMethods());
    app.use(mount('/api-docs', serve(absolutePath())));
  }
}
