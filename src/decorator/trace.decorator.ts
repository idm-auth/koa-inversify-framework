import { trace, SpanStatusCode, SpanKind, context } from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';
import { EnvSymbol, type AbstractEnv } from '@/infrastructure/env/defaultEnv.provider';
import { EnvKey } from '@/common/env.types';
import { getGlobalContainer } from '@/infrastructure/inversify/container.provider';

export type { Span };

function getEnv(): AbstractEnv {
  return getGlobalContainer().get<AbstractEnv>(EnvSymbol);
}

function createSpan(
  name: string,
  attributes?: Record<string, string | number | boolean>
): Span {
  const env = getEnv();
  const serviceName = env.get(EnvKey.APPLICATION_NAME);
  const serviceVersion = env.get(EnvKey.APPLICATION_VERSION);
  console.debug('[TraceDecorator] Creating tracer:', { serviceName, serviceVersion, spanName: name });
  const tracer = trace.getTracer(serviceName, serviceVersion);
  const span = tracer.startSpan(name, { kind: SpanKind.INTERNAL });
  if (attributes) span.setAttributes(attributes);
  return span;
}

function handleSuccess(span: Span): void {
  span.setStatus({ code: SpanStatusCode.OK });
}

function handleError(span: Span, error: Error): void {
  span.recordException(error);
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error.message,
  });
}

export function Trace(
  spanName?: string,
  attributes?: Record<string, string | number | boolean>
) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
      const name = spanName || `${(this as { constructor: { name: string } }).constructor.name}.${propertyKey}`;
      const span = createSpan(name, attributes);

      return context.with(trace.setSpan(context.active(), span), () => {
        try {
          const result = originalMethod.apply(this, args);
          handleSuccess(span);
          span.end();
          return result;
        } catch (error) {
          handleError(span, error as Error);
          span.end();
          throw error;
        }
      });
    };

    return descriptor;
  };
}

export function TraceAsync(
  spanName?: string,
  attributes?: Record<string, string | number | boolean>
) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value as (...args: unknown[]) => Promise<unknown>;

    descriptor.value = async function (this: unknown, ...args: unknown[]): Promise<unknown> {
      const name = spanName || `${(this as { constructor: { name: string } }).constructor.name}.${propertyKey}`;
      const span = createSpan(name, attributes);

      return context.with(trace.setSpan(context.active(), span), async () => {
        try {
          const result = await originalMethod.apply(this, args);
          handleSuccess(span);
          return result;
        } catch (error) {
          handleError(span, error as Error);
          throw error;
        } finally {
          span.end();
        }
      });
    };

    return descriptor;
  };
}

export function getCurrentSpan(): Span | undefined {
  return trace.getSpan(context.active());
}
