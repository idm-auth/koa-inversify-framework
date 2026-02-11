/**
 * MagicRouter - Enhanced Koa Router with OpenAPI Integration
 *
 * Este router combina funcionalidades do Koa Router com geração automática
 * de documentação OpenAPI/Swagger usando zod-to-openapi.
 *
 * TIPOS GENÉRICOS:
 *
 * MagicRouter<TContext> - Cada router é genérico sobre seu tipo de Context.
 * Todas as rotas de um router específico usam o mesmo TContext.
 * Routers com diferentes TContext podem ser compostos via useMagic().
 */

import {
  requestValidationMiddleware,
  responseValidationMiddleware,
} from '@/middlewares/validation.middleware';
import {
  authenticationMiddleware,
  AuthenticationConfig,
} from '@/middlewares/authentication.middleware';
import { authorizationMiddleware } from '@/middlewares/authorization.middleware';
import { getLoggerNoAsync } from '@/plugins/pino.plugin';
import { getEnvValue, EnvKey } from '@/plugins/dotenv.plugin';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  RouteConfig,
} from '@asteasolutions/zod-to-openapi';
import Router from '@koa/router';
import { Context, Next } from 'koa';
import pino from 'pino';
import { registry } from '../../domains/swagger/openApiGenerator';

// Method type (from zod-to-openapi RouteConfig)
export type Method =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'head'
  | 'options'
  | 'trace';

export type AuthorizationConfig = {
  systemId?: string;
  operation: string;
  resource: string;
};

export type MagicRouteConfig<TContext extends Context = Context> =
  RouteConfig & {
    name: string;
    middlewares?: Array<(ctx: TContext, next: Next) => Promise<void>>;
    handlers: Array<(ctx: TContext, next: Next) => Promise<void>>;
    authentication?: AuthenticationConfig;
    authorization?: AuthorizationConfig;
  };

export type MagicRouteConfigWithoutMethod<TContext extends Context = Context> =
  Omit<MagicRouteConfig<TContext>, 'method'>;

export class MagicRouter<TContext extends Context = Context> {
  private router: Router;

  private routeConfigs: Array<MagicRouteConfig<TContext>> = [];
  private childRouters: Array<{
    pathPrefix: string;
    router: MagicRouter<TContext>;
  }> = [];
  private basePath: string;
  private logger: pino.Logger;

  constructor(opts?: Router.RouterOptions) {
    this.router = new Router(opts);
    this.basePath = opts?.prefix || '';
    this.logger = getLoggerNoAsync();
  }

  private buildHandlers(config: MagicRouteConfig<TContext>) {
    const middlewares = config.middlewares || [];
    const requestValidation = requestValidationMiddleware<TContext>(config);
    const responseValidation = responseValidationMiddleware<TContext>(config);

    // Set pathPattern in ctx.state (convert actual path back to pattern)
    const pathPatternMiddleware = async (ctx: TContext, next: Next) => {
      // ctx._matchedRoute contains the matched route pattern (e.g., /api/realm/:tenantId/accounts/:id)
      ctx.state.pathPattern = ctx._matchedRoute || ctx.path;
      await next();
    };

    // Autenticação (qualquer método válido)
    const authenticationMiddlewares = [];
    if (config.authentication) {
      authenticationMiddlewares.push(
        authenticationMiddleware(config.authentication)
      );
    }

    // Autorização
    const authorizationMiddlewares = [];
    if (config.authorization) {
      authorizationMiddlewares.push(
        authorizationMiddleware(config.authorization)
      );
    }

    // Wrapper apenas no último handler para chamar next()
    const handlers = [...config.handlers];
    const lastHandler = handlers.pop();

    const wrappedLastHandler = async (ctx: TContext, next: Next) => {
      await lastHandler!(ctx, async () => {});
      await next(); // Chama o responseValidation
    };

    return [
      requestValidation,
      pathPatternMiddleware,
      ...authenticationMiddlewares,
      ...authorizationMiddlewares,
      ...middlewares,
      ...handlers,
      wrappedLastHandler,
      responseValidation,
    ];
  }

  private convertPath(path: string): string {
    // Converte path OpenAPI {param} para Koa :param
    return path.replace(/\{(\w+)\}/g, ':$1');
  }

  useMagic(
    pathPrefixOrRouter: string | MagicRouter<TContext>,
    router?: MagicRouter<TContext>
  ): this {
    if (typeof pathPrefixOrRouter === 'string' && router) {
      this.router.use(
        pathPrefixOrRouter,
        router.routes(),
        router.allowedMethods()
      );
      this.childRouters.push({ pathPrefix: pathPrefixOrRouter, router });
    } else if (pathPrefixOrRouter instanceof MagicRouter) {
      this.router.use(
        pathPrefixOrRouter.routes(),
        pathPrefixOrRouter.allowedMethods()
      );
      this.childRouters.push({ pathPrefix: '', router: pathPrefixOrRouter });
    }
    return this;
  }

  getRouteConfigs(): MagicRouteConfig<TContext>[] {
    return this.routeConfigs;
  }

  // Deprecated: Use getRouteConfigs() instead
  getSwaggerRoutes(): MagicRouteConfig<TContext>[] {
    return this.routeConfigs;
  }

  registryAll(parentPrefix: string = ''): void {
    const fullPrefix = parentPrefix + this.basePath;

    // Registra rotas próprias
    this.routeConfigs.forEach((route) => {
      const routeConfig: RouteConfig = {
        ...route,
        path: fullPrefix + route.path,
      };

      // Adiciona security se authentication está configurado
      if (route.authentication) {
        const hasJwt =
          route.authentication.someOneMethod ||
          route.authentication.onlyMethods?.jwt;
        if (hasJwt) {
          routeConfig.security = [{ bearerAuth: [] }];
        }
      }

      if (getEnvValue(EnvKey.NODE_ENV) === 'development') {
        const testRegistry = new OpenAPIRegistry();
        try {
          testRegistry.registerPath(routeConfig);

          const generator = new OpenApiGeneratorV3(testRegistry.definitions);
          generator.generateDocument({
            openapi: '3.0.0',
            info: {
              title: 'API Documentation',
              version: '1.0.0',
            },
          });
        } catch (error) {
          this.logger.error(
            error,
            `Invalid schema in route ${route.name} at ${routeConfig.path}:`
          );
          this.logger.error(
            { testRegistry: testRegistry.definitions },
            `testRegistry:`
          );
          this.logger.error(
            `Route config: ${JSON.stringify(routeConfig, null, 2)}`
          );

          throw error;
        }
      }

      registry.registerPath(routeConfig);
    });

    // Chama registryAll nos routers filhos
    this.childRouters.forEach(({ pathPrefix, router }) => {
      if (router instanceof MagicRouter) {
        router.registryAll(fullPrefix + pathPrefix);
      } else {
        // @ts-expect-error - router pode não ter constructor
        const typeName = router?.constructor?.name ?? typeof router;
        this.logger.error(
          `Router at path '${pathPrefix}' is not a MagicRouter instance. Type: ${typeName}`
        );
      }
    });
  }

  // Métodos para expor funcionalidades do Router
  routes() {
    return this.router.routes();
  }

  allowedMethods() {
    return this.router.allowedMethods();
  }

  // Usado em: koaServer.plugin.ts (logRoutesDetailed)
  getInternalRouter() {
    return this.router;
  }

  /**
   * Get Available Actions
   *
   * Extracts availableActions from routes with authorization config.
   * Recursively collects from child routers and groups by systemId.
   *
   * @param systemId - Default systemId for routes without explicit systemId
   * @param accumulator - Accumulated results from parent routers
   * @param parentPrefix - Internal: accumulated prefix from parent routers
   * @returns Array grouped by systemId with their availableActions
   */
  getAvailableActions(
    systemId: string,
    accumulator: Array<{
      systemId: string;
      availableActions: Array<{
        resourceType: string;
        pathPattern: string;
        operations: string[];
      }>;
    }> = [],
    parentPrefix = ''
  ): Array<{
    systemId: string;
    availableActions: Array<{
      resourceType: string;
      pathPattern: string;
      operations: string[];
    }>;
  }> {
    const fullPrefix = parentPrefix + this.basePath;

    // Collect own routes with authorization
    this.routeConfigs
      .filter((route) => route.authorization)
      .forEach((route) => {
        const fullPath = fullPrefix + route.path;
        const { resource, operation } = route.authorization!;
        const actionSystemId = route.authorization!.systemId ?? systemId;

        let system = accumulator.find((s) => s.systemId === actionSystemId);
        if (!system) {
          system = { systemId: actionSystemId, availableActions: [] };
          accumulator.push(system);
        }

        let action = system.availableActions.find(
          (a) => a.pathPattern === fullPath
        );
        if (!action) {
          action = {
            resourceType: resource,
            pathPattern: fullPath,
            operations: [],
          };
          system.availableActions.push(action);
        }

        if (!action.operations.includes(operation)) {
          action.operations.push(operation);
        }
      });

    // Collect recursively from child routers
    this.childRouters.forEach(({ pathPrefix, router }) => {
      router.getAvailableActions(
        systemId,
        accumulator,
        fullPrefix + pathPrefix
      );
    });

    return accumulator;
  }

  private registerRoute(
    method: Method,
    config: MagicRouteConfigWithoutMethod<TContext>
  ) {
    const configLocal = { ...config, method };
    const allHandlers = this.buildHandlers(configLocal);
    const koaPath = this.convertPath(configLocal.path);
    this.routeConfigs.push(configLocal);
    return { koaPath, allHandlers };
  }

  // HTTP Methods
  get(config: MagicRouteConfigWithoutMethod<TContext>): this {
    const { koaPath, allHandlers } = this.registerRoute('get', config);
    this.router.get(koaPath, ...allHandlers);
    return this;
  }

  post(config: MagicRouteConfigWithoutMethod<TContext>): this {
    const { koaPath, allHandlers } = this.registerRoute('post', config);
    this.router.post(koaPath, ...allHandlers);
    return this;
  }

  put(config: MagicRouteConfigWithoutMethod<TContext>): this {
    const { koaPath, allHandlers } = this.registerRoute('put', config);
    this.router.put(koaPath, ...allHandlers);
    return this;
  }

  delete(config: MagicRouteConfigWithoutMethod<TContext>): this {
    const { koaPath, allHandlers } = this.registerRoute('delete', config);
    this.router.delete(koaPath, ...allHandlers);
    return this;
  }

  patch(config: MagicRouteConfigWithoutMethod<TContext>): this {
    const { koaPath, allHandlers } = this.registerRoute('patch', config);
    this.router.patch(koaPath, ...allHandlers);
    return this;
  }
}
