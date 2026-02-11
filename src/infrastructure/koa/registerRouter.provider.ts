import { getRouteMetadata } from '@/decorator/route.decorator';
import { HttpMethod } from '@/common/http.types';
import { Configuration } from '@/stereotype/configuration.stereotype';
import {
  getControllerOptions,
  ControllerConstructor,
} from '@/stereotype/controller.stereotype';
import {
  processSwaggerRoute,
  OpenApiRegistryProvider,
  OpenApiRegistrySymbol,
} from '@/infrastructure/swagger';
import {
  KoaServer,
  KoaServerSymbol,
} from '@/infrastructure/koa/koaServer.provider';
import {
  LoggerProvider,
  LoggerSymbol,
} from '@/infrastructure/logger/logger.provider';
import { AbstractEnv, EnvSymbol } from '@/index';
import { EnvKey } from '@/common/env.types';
import { inject, Container } from 'inversify';
import {
  KoaMiddleware,
  MiddlewareBuilderFn,
} from '@/infrastructure/koa/middleware/middleware.types';
import { buildExecutionContext } from '@/infrastructure/koa/middleware/executionContext.build.middleware';
import { buildAuthenticationMiddleware } from '@/infrastructure/koa/middleware/authentication.build.middleware';
import { buildZodValidateRequest } from '@/infrastructure/koa/middleware/zodValidateRequest.build.middleware';
import { buildAuthorize } from '@/infrastructure/koa/middleware/authorize.build.middleware';
import { buildZodValidateResponse } from '@/infrastructure/koa/middleware/zodValidateResponse.build.middleware';
import { buildInjectCoreTenantId } from '@/infrastructure/koa/middleware/injectCoreTenantId.build.middleware';
import compose from 'koa-compose';
import { Context } from 'koa';

export const RegisterRouterSymbol = Symbol.for('RegisterRouter');

type ControllerInstance = Record<string, unknown> & {
  constructor: ControllerConstructor;
};

@Configuration(RegisterRouterSymbol)
export class RegisterRouter {
  private routeHandlers = new Map<string, KoaMiddleware[]>();

  private executionContextBuilders: MiddlewareBuilderFn[] = [
    buildExecutionContext,
    buildInjectCoreTenantId,
  ];

  private authenticationBuilders: MiddlewareBuilderFn[] = [
    buildAuthenticationMiddleware,
  ];

  private validationRequestBuilders: MiddlewareBuilderFn[] = [
    buildZodValidateRequest,
  ];

  private authorizationBuilders: MiddlewareBuilderFn[] = [buildAuthorize];

  private validationResponseBuilders: MiddlewareBuilderFn[] = [
    buildZodValidateResponse,
  ];

  constructor(
    @inject(KoaServerSymbol) private koaServer: KoaServer,
    @inject(LoggerSymbol) private loggerProvider: LoggerProvider,
    @inject(OpenApiRegistrySymbol)
    private registryProvider: OpenApiRegistryProvider,
    @inject(EnvSymbol) private env: AbstractEnv
  ) {}

  private get logger() {
    return this.loggerProvider.getLogger();
  }

  private buildHandlers(
    controllerClass: ControllerConstructor,
    controller: ControllerInstance,
    methodName: string,
    container: Container
  ): KoaMiddleware[] {
    const handlers: KoaMiddleware[] = [];

    for (const builder of this.executionContextBuilders) {
      const middleware = builder(controllerClass, methodName, container);
      if (middleware) handlers.push(middleware);
    }

    for (const builder of this.authenticationBuilders) {
      const middleware = builder(controllerClass, methodName, container);
      if (middleware) handlers.push(middleware);
    }

    for (const builder of this.validationRequestBuilders) {
      const middleware = builder(controllerClass, methodName, container);
      if (middleware) handlers.push(middleware);
    }

    for (const builder of this.authorizationBuilders) {
      const middleware = builder(controllerClass, methodName, container);
      if (middleware) handlers.push(middleware);
    }

    const method = controller[methodName];
    if (typeof method === 'function') {
      handlers.push(method.bind(controller) as KoaMiddleware);
    }

    for (const builder of this.validationResponseBuilders) {
      const middleware = builder(controllerClass, methodName, container);
      if (middleware) handlers.push(middleware);
    }

    return handlers;
  }

  private registerRoute(
    router: ReturnType<KoaServer['getRouter']>,
    controllerClass: ControllerConstructor,
    controller: ControllerInstance,
    methodName: string,
    route: ReturnType<typeof getRouteMetadata>[string],
    fullPath: string,
    container: Container
  ): void {
    const method = controller[methodName];
    if (typeof method !== 'function') {
      this.logger.warn({ methodName }, 'Route method not found');
      return;
    }

    const handlers = this.buildHandlers(
      controllerClass,
      controller,
      methodName,
      container
    );

    const routeKey = `${route.method}:${fullPath}`;
    this.routeHandlers.set(routeKey, handlers);

    const routerMethods = {
      [HttpMethod.GET]: router.get.bind(router),
      [HttpMethod.POST]: router.post.bind(router),
      [HttpMethod.PUT]: router.put.bind(router),
      [HttpMethod.DELETE]: router.delete.bind(router),
      [HttpMethod.PATCH]: router.patch.bind(router),
    };

    const routerMethod = routerMethods[route.method];
    if (routerMethod) {
      routerMethod(fullPath, ...handlers);
      this.logger.debug(
        {
          method: route.method,
          path: fullPath,
          handler: `${controllerClass.name}.${methodName}`,
          handlersCount: handlers.length,
        },
        'Route registered'
      );

      processSwaggerRoute(
        this.registryProvider.getRegistry(),
        controllerClass,
        methodName,
        route,
        fullPath
      );
    }
  }

  getRouteHandlers(path: string, method: string): KoaMiddleware[] | undefined {
    const routeKey = `${method}:${path}`;
    this.logger.debug(
      { routeKey, availableRoutes: Array.from(this.routeHandlers.keys()) },
      'RegisterRouter.getRouteHandlers - looking up route'
    );
    return this.routeHandlers.get(routeKey);
  }

  async executeRoute(
    path: string,
    method: string,
    ctx: Context
  ): Promise<void> {
    this.logger.debug(
      { path, method },
      'RegisterRouter.executeRoute - executing route'
    );

    const handlers = this.getRouteHandlers(path, method);
    if (!handlers) {
      this.logger.error(
        {
          path,
          method,
          availableRoutes: Array.from(this.routeHandlers.keys()),
        },
        'RegisterRouter.executeRoute - route not found'
      );
      throw new Error(`Route not found: ${method} ${path}`);
    }

    this.logger.debug(
      { path, method, handlersCount: handlers.length },
      'RegisterRouter.executeRoute - executing handlers'
    );

    await compose(handlers)(ctx);

    this.logger.debug(
      { path, method },
      'RegisterRouter.executeRoute - execution completed'
    );
  }

  registerController(controllerSymbol: symbol, container: Container): void {
    const router = this.koaServer.getRouter();
    const controller = container.get<ControllerInstance>(controllerSymbol);
    const controllerClass = controller.constructor;

    const controllerOptions = getControllerOptions(controllerClass);
    if (!controllerOptions) {
      this.logger.warn(
        { controllerSymbol: controllerSymbol.toString() },
        'No controller metadata found'
      );
      return;
    }

    this.logger.info(
      {
        basePath: controllerOptions.basePath,
        multiTenant: controllerOptions.multiTenant,
      },
      'Registering controller'
    );

    const routes = getRouteMetadata(controllerClass);
    const contextPath = this.env.get(EnvKey.SERVER_CONTEXT_PATH);

    Object.entries(routes).forEach(([methodName, route]) => {
      const fullPath = (contextPath + controllerOptions.basePath + route.path)
        .replace(/\/+/g, '/')
        .replace(/\/$/, '') || '/';

      this.registerRoute(
        router,
        controllerClass,
        controller,
        methodName,
        route,
        fullPath,
        container
      );
    });

    this.koaServer.applyRouter(container);
  }
}
