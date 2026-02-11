import '@/infrastructure/env/dotenv.provider';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { IncomingMessage } from 'http';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

export const TelemetrySymbol = Symbol.for('Telemetry');

export function createTelemetrySDK(): NodeSDK {
  const logLevel = (DiagLogLevel[
    process.env.Telemetry_LOG_LEVEL as keyof typeof DiagLogLevel
  ] ?? DiagLogLevel.WARN) as DiagLogLevel;

  diag.setLogger(new DiagConsoleLogger(), logLevel);

  const traceExporter = new OTLPTraceExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      'http://jaeger:4318/v1/traces',
  });

  const prometheusExporter = new PrometheusExporter({
    port: parseInt(process.env.PROMETHEUS_PORT || '9464'),
    endpoint: '/metrics',
  });

  const sdk = new NodeSDK({
    serviceName: process.env.APPLICATION_NAME,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          requestHook: (span, request) => {
            if (request instanceof IncomingMessage && request.url) {
              span.updateName(`${request.method} ${request.url}`);
            }
          },
        },
      }),
    ],
    traceExporter,
    metricReaders: [prometheusExporter],
  });

  return sdk;
}
