import { createStereotype } from '@/stereotype/stereotype.utils';
import { setStereotypeIdentity, StereotypeType } from '@/stereotype/stereotype.metadata';
import { injectFromHierarchy } from 'inversify';

const ControllerOptionsKey = Symbol.for('controller:options');

export type ControllerConstructor = new (...args: never[]) => object;

export interface ControllerOptions {
  basePath: string;
  multiTenant?: boolean;
  system?: string;      // Authorization: system part of action (e.g., 'iam')
  resource?: string;    // Authorization: resource part of action (e.g., 'applications')
}

export function Controller(symbol: symbol, options: ControllerOptions) {
  const baseDecorator = createStereotype();
  const injectFromHierarchyDecorator = injectFromHierarchy({
    extendProperties: true,
  });

  return function <T extends new (...args: never[]) => object>(target: T): T {
    setStereotypeIdentity(target, symbol, StereotypeType.Controller);
    
    const controllerOptions: ControllerOptions = {
      basePath: options.basePath,
      multiTenant: options.multiTenant ?? false,
      system: options.system,
      resource: options.resource,
    };
    Reflect.defineMetadata(ControllerOptionsKey, controllerOptions, target);
    
    const decoratedTarget = baseDecorator(target);
    const final = injectFromHierarchyDecorator(decoratedTarget);

    return final ?? decoratedTarget;
  };
}

export function getControllerOptions(
  target: object
): ControllerOptions | undefined {
  const metadata: unknown = Reflect.getMetadata(
    ControllerOptionsKey,
    target
  );
  if (!metadata) return undefined;
  return metadata as ControllerOptions;
}

/**
 * METADATA ARCHITECTURE - FUTURE IMPLEMENTATION
 *
 * Esta seção documenta a arquitetura de metadata que será implementada
 * para suportar decorators em controllers e methods.
 *
 * ESTRUTURA DE METADATA KEYS:
 *
 * Class-level (Controller):
 * - CONTROLLER_BASEPATH = Symbol('controller:basePath')
 * - CONTROLLER_AUTH_DEFAULT = Symbol('controller:auth:default')
 * - CONTROLLER_RATELIMIT_DEFAULT = Symbol('controller:rateLimit:default')
 *
 * Method-level (Route decorators):
 * - METHOD_ROUTE = Symbol('method:route')
 * - METHOD_AUTH = Symbol('method:auth')
 * - METHOD_RATELIMIT = Symbol('method:rateLimit')
 * - METHOD_VALIDATION = Symbol('method:validation')
 *
 * PADRÃO DE NOMENCLATURA:
 * {SCOPE}_{FEATURE} ou {SCOPE}_{FEATURE}_{VARIANT}
 * - Scope: CONTROLLER ou METHOD
 * - Feature: BASEPATH, AUTH, RATELIMIT, ROUTE, VALIDATION
 * - Variant: DEFAULT (quando aplicável)
 *
 * LÓGICA DE MERGE (Controller + Method):
 *
 * Ao processar uma rota no RegisterRouter:
 *
 * const controllerAuth = Reflect.getMetadata(CONTROLLER_AUTH_DEFAULT, controllerClass);
 * const methodAuth = Reflect.getMetadata(METHOD_AUTH, controllerClass.prototype, methodName);
 *
 * // Strategy 1: Override (method sobrescreve controller)
 * const finalAuth = methodAuth ?? controllerAuth;
 *
 * // Strategy 2: Merge (method complementa controller)
 * const finalAuth = { ...controllerAuth, ...methodAuth };
 *
 * // Strategy 3: Concatenate (method adiciona ao controller)
 * const finalAuth = [...(controllerAuth || []), ...(methodAuth || [])];
 *
 * EXEMPLO DE USO FUTURO:
 *
 * @Controller(AccountControllerSymbol, {
 *   basePath: '/accounts',
 *   auth: { required: true, methods: ['jwt'] },
 *   rateLimit: { max: 100, window: '1m' }
 * })
 * export class AccountController {
 *
 *   @Get('/:id')
 *   @Auth({ permissions: ['account:read'] })  // Merge com controller auth
 *   @RateLimit({ max: 10 })                   // Override controller rateLimit
 *   async findById(ctx: Context) { ... }
 * }
 *
 * VANTAGENS DESTA ARQUITETURA:
 * - Separação clara entre class-level e method-level
 * - Leitura granular (pega só o que precisa)
 * - Cada decorator trabalha independente
 * - Merge explícito no momento do uso
 * - Extensível para novos decorators
 *
 * REFERÊNCIA:
 * - old/src/utils/core/MagicRouter.ts (implementação anterior)
 * - NestJS metadata pattern (inspiração)
 */
