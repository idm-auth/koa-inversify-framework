import { collectMetadataFromPrototypeChain } from './metadata.util';
import { HttpMethod } from '@/common/http.types';

const RouteMethodsMetadataKey = Symbol.for('routeMethods:metadata');

export interface RouteMetadata {
  method: HttpMethod;
  path: string;
}

export type RouteMetadataMap = Record<string, RouteMetadata>;

function createRouteDecorator(method: HttpMethod) {
  return (path: string): MethodDecorator => {
    return (target: object, propertyKey: string | symbol) => {
      const routes: RouteMetadataMap =
        (Reflect.getMetadata(RouteMethodsMetadataKey, target) as
          | RouteMetadataMap
          | undefined) || {};
      routes[propertyKey as string] = {
        method,
        path,
      };
      Reflect.defineMetadata(RouteMethodsMetadataKey, routes, target);
    };
  };
}

export const Get = createRouteDecorator(HttpMethod.GET);
export const Post = createRouteDecorator(HttpMethod.POST);
export const Put = createRouteDecorator(HttpMethod.PUT);
export const Delete = createRouteDecorator(HttpMethod.DELETE);
export const Patch = createRouteDecorator(HttpMethod.PATCH);

export function getRouteMetadata(targetClass: object): RouteMetadataMap {
  return collectMetadataFromPrototypeChain<RouteMetadataMap>(
    (targetClass as { prototype: object }).prototype,
    RouteMethodsMetadataKey
  );
}
