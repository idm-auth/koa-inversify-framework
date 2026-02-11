import { z } from 'zod';
import 'reflect-metadata';
import { collectMetadataFromPrototypeChain } from './metadata.util';

const ZodValidationMetadataKey = Symbol.for('zodValidation:metadata');

export interface ZodValidateRequestOptions {
  params?: z.ZodSchema;
  body?: z.ZodSchema;
  query?: z.ZodSchema;
}

export type ZodValidationMetadataMap = Record<string, ZodValidateRequestOptions>;

export function ZodValidateRequest(options: ZodValidateRequestOptions) {
  return function (target: object, propertyKey: string | symbol) {
    const validations: ZodValidationMetadataMap =
      (Reflect.getMetadata(ZodValidationMetadataKey, target) as
        | ZodValidationMetadataMap
        | undefined) || {};

    validations[propertyKey as string] = options;

    Reflect.defineMetadata(ZodValidationMetadataKey, validations, target);
  };
}

export function getZodValidationMetadata(targetClass: object): ZodValidationMetadataMap {
  return collectMetadataFromPrototypeChain<ZodValidationMetadataMap>(
    (targetClass as { prototype: object }).prototype,
    ZodValidationMetadataKey
  );
}
