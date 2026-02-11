import 'reflect-metadata';

/**
 * Collects metadata from the entire prototype chain
 * @param target - Starting point (usually Class.prototype)
 * @param metadataKey - Symbol key for the metadata
 * @returns Merged metadata from all prototypes
 */
export function collectMetadataFromPrototypeChain<
  T extends Record<string, unknown>,
>(target: object, metadataKey: symbol): T {
  const result = {} as T;
  let current: object | null = target;

  while (
    current !== null &&
    current !== Object.prototype &&
    current !== Function.prototype
  ) {
    const metadata: unknown = Reflect.getOwnMetadata(metadataKey, current);
    if (metadata) {
      Object.assign(result, metadata as T);
    }
    
    // Object.getPrototypeOf returns 'any' in TypeScript's type definitions.
    // This is safe because:
    // 1. The while condition guards against null (stops iteration)
    // 2. We explicitly check for Object.prototype and Function.prototype
    // 3. The result is always either an object or null (end of chain)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    current = Object.getPrototypeOf(current);
  }

  return result;
}
