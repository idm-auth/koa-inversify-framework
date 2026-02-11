import { z } from 'zod';
import 'reflect-metadata';
import { collectMetadataFromPrototypeChain } from './metadata.util';

const ZodValidateResponseMetadataKey = Symbol.for('zodValidateResponse:metadata');

export interface ZodValidateResponseOptions {
  [statusCode: number]: z.ZodSchema;
}

export type ZodValidateResponseMetadataMap = Record<string, ZodValidateResponseOptions>;

export function ZodValidateResponse(options: ZodValidateResponseOptions) {
  return function (target: object, propertyKey: string | symbol) {
    const validations: ZodValidateResponseMetadataMap =
      (Reflect.getMetadata(ZodValidateResponseMetadataKey, target) as
        | ZodValidateResponseMetadataMap
        | undefined) || {};

    validations[propertyKey as string] = options;

    Reflect.defineMetadata(ZodValidateResponseMetadataKey, validations, target);
  };
}

export function getZodValidateResponseMetadata(targetClass: object): ZodValidateResponseMetadataMap {
  return collectMetadataFromPrototypeChain<ZodValidateResponseMetadataMap>(
    (targetClass as { prototype: object }).prototype,
    ZodValidateResponseMetadataKey
  );
}
