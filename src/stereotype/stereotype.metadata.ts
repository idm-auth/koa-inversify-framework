const StereotypeSymbolKey = Symbol.for('stereotype:symbol');
const StereotypeTypeKey = Symbol.for('stereotype:type');

export const StereotypeType = {
  Controller: 'Controller',
  Service: 'Service',
  Repository: 'Repository',
  Mapper: 'Mapper',
  Configuration: 'Configuration',
} as const;

export type StereotypeType = typeof StereotypeType[keyof typeof StereotypeType];

export interface StereotypeIdentity {
  symbol: symbol;
  type: StereotypeType;
}

export function setStereotypeIdentity(
  target: object,
  symbol: symbol,
  type: StereotypeType
): void {
  Reflect.defineMetadata(StereotypeSymbolKey, symbol, target);
  Reflect.defineMetadata(StereotypeTypeKey, type, target);
}

export function getStereotypeSymbol(target: object): symbol | undefined {
  return Reflect.getMetadata(StereotypeSymbolKey, target) as symbol | undefined;
}

export function getStereotypeType(target: object): StereotypeType | undefined {
  return Reflect.getMetadata(StereotypeTypeKey, target) as StereotypeType | undefined;
}

export function getStereotypeIdentity(target: object): StereotypeIdentity | undefined {
  const symbol = getStereotypeSymbol(target);
  const type = getStereotypeType(target);
  if (!symbol || !type) return undefined;
  return { symbol, type };
}
