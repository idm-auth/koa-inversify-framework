// This file simulates an external application using the framework as a library
// It demonstrates how the framework should be initialized and used
import 'reflect-metadata';
import { Container } from 'inversify';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { Framework } from './src/index';
import { SampleMultiTenantModule } from './test/fixtures/domain/sampleMultiTenant/sampleMultiTenant.module';
import { SampleSingleTenantModule } from './test/fixtures/domain/sampleSingleTenant/sampleSingleTenant.module';
import { CustomErrorHandler } from './test/fixtures/errorHandler.example';
import { RealmTenantResolver } from './test/fixtures/tenant/realmTenantResolver.provider';

const container = new Container();
const registry = new OpenAPIRegistry();
const framework = new Framework();
const errorHandler = new CustomErrorHandler();
const tenantResolver = new RealmTenantResolver();

framework.setContainer(container);
framework.setRegistry(registry);
framework.setErrorHandler(errorHandler);
framework.setTenantResolver(tenantResolver);
await framework.init();

new SampleMultiTenantModule(container);
new SampleSingleTenantModule(container);

await framework.listen();

process.on('SIGTERM', async () => {
  await framework.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await framework.shutdown();
  process.exit(0);
});
