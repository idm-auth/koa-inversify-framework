import 'reflect-metadata';
import { collectMetadataFromPrototypeChain } from './metadata.util';
import type { RouteConfig } from '@asteasolutions/zod-to-openapi';

const SwaggerDocMetadataSymbol = Symbol.for('swaggerDoc:metadata');
const SwaggerDocControllerMetadataSymbol = Symbol.for(
  'swaggerDocController:metadata'
);

export type SwaggerDocOptions = Omit<RouteConfig, 'method' | 'path'>;

export interface SwaggerDocControllerOptions {
  name: string;
  description?: string;
  tags?: string[];
}

export type SwaggerDocMetadataMap = Record<string, SwaggerDocOptions>;

export function SwaggerDoc(options: SwaggerDocOptions) {
  return function (target: object, propertyKey: string | symbol) {
    const existingDocs = (Reflect.getMetadata(
      SwaggerDocMetadataSymbol,
      target
    ) || {}) as SwaggerDocMetadataMap;

    const docs: SwaggerDocMetadataMap = {
      ...existingDocs,
      [String(propertyKey)]: options,
    };

    Reflect.defineMetadata(SwaggerDocMetadataSymbol, docs, target);
  };
}

export function SwaggerDocController(options: SwaggerDocControllerOptions) {
  return function (target: object) {
    Reflect.defineMetadata(
      SwaggerDocControllerMetadataSymbol,
      options,
      target
    );
  };
}

export function getSwaggerDocMetadata(targetClass: {
  prototype: object;
}): SwaggerDocMetadataMap {
  return collectMetadataFromPrototypeChain<SwaggerDocMetadataMap>(
    targetClass.prototype,
    SwaggerDocMetadataSymbol
  );
}

export function getSwaggerControllerMetadata(
  targetClass: object
): SwaggerDocControllerOptions | undefined {
  return Reflect.getMetadata(
    SwaggerDocControllerMetadataSymbol,
    targetClass
  ) as SwaggerDocControllerOptions | undefined;
}
