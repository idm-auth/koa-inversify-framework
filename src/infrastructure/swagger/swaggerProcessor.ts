import {
  getControllerOptions,
  ControllerConstructor,
} from '@/stereotype/controller.stereotype';
import {
  getSwaggerDocMetadata,
  getSwaggerControllerMetadata,
} from '@/decorator/swaggerDoc.decorator';
import type {
  RouteConfig,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import type { RouteMetadata } from '@/decorator/route.decorator';

function convertPath(path: string): string {
  return path.replace(/:([\w]+)/g, '{$1}');
}

export function processSwaggerRoute(
  registry: OpenAPIRegistry,
  controllerClass: ControllerConstructor,
  methodName: string,
  route: RouteMetadata,
  fullPath: string
): void {
  const controllerOptions = getControllerOptions(controllerClass);
  const swaggerControllerMetadata =
    getSwaggerControllerMetadata(controllerClass);
  const swaggerDocMetadata = getSwaggerDocMetadata(controllerClass);

  if (!controllerOptions) return;

  const methodSwaggerDoc = swaggerDocMetadata?.[methodName];
  const controllerTags = swaggerControllerMetadata?.tags || [];

  const routeConfig: RouteConfig = {
    method: route.method.toLowerCase() as RouteConfig['method'],
    path: convertPath(fullPath),
    ...methodSwaggerDoc,
    summary: methodSwaggerDoc?.summary,
    description:
      methodSwaggerDoc?.description || swaggerControllerMetadata?.description,
    tags: methodSwaggerDoc?.tags || controllerTags,
    responses: methodSwaggerDoc?.responses || {
      200: {
        description: 'Success',
      },
    },
  };

  registry.registerPath(routeConfig);
}
