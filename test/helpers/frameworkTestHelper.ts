import { Framework } from '@/index';
import {
  ExecutionContextProvider,
  ExecutionContextSymbol,
} from '@/infrastructure/context/executionContext.provider';
import { AbstractEnv, EnvSymbol } from '@/index';
import { EnvKey } from '@/common/env.types';
import {
  KoaServer,
  KoaServerSymbol,
} from '@/infrastructure/koa/koaServer.provider';
import {
  MongoDB,
  MongoDBSymbol,
} from '@/infrastructure/mongodb/mongodb.provider';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { RealmTenantResolver } from '@test/fixture/tenant/RealmTenantResolver.provider';
import { Container } from 'inversify';
import type Koa from 'koa';
import { v4 as uuidv4 } from 'uuid';
import { RealmEntity } from '../fixture/domain/realm/realm.entity';
import { RealmModule } from '../fixture/domain/realm/realm.module';
import {
  RealmService,
  RealmServiceSymbol,
} from '../fixture/domain/realm/realm.service';

export class FrameworkTestHelper {
  private framework: Framework;
  private container: Container;
  private registry: OpenAPIRegistry;

  constructor() {
    this.framework = new Framework();
    this.container = new Container();
    this.registry = new OpenAPIRegistry();
  }

  setupTenantResolver(): void {
    this.framework.setTenantResolver(RealmTenantResolver);
  }

  async initCore(): Promise<void> {
    this.setupTenantResolver();
    await this.framework.initCore(this.container);
  }

  async initDB(): Promise<void> {
    await this.framework.initDB(this.container);
  }

  async initKoa(): Promise<void> {
    this.framework.setRegistry(this.registry);
    await this.framework.initKoa(this.container);
  }

  async init(): Promise<void> {
    this.setupTenantResolver();
    this.framework.setContainer(this.container);
    this.framework.setRegistry(this.registry);
    await this.framework.init();
  }

  async shutdownKoa(): Promise<void> {
    await this.framework.shutdownKoa();
  }

  async shutdownDB(): Promise<void> {
    await this.framework.shutdownDB();
  }

  async shutdown(): Promise<void> {
    await this.framework.shutdown();
  }

  getApp(): Koa {
    const koaServer = this.container.get<KoaServer>(KoaServerSymbol);
    return koaServer.getApp();
  }

  getContainer(): Container {
    return this.container;
  }

  async setupTestRealm(
    testName: string,
    isMultiTenant: boolean
  ): Promise<RealmEntity> {
    if (!this.container.isBound(RealmServiceSymbol)) {
      new RealmModule(this.container);
    }

    const realmService = this.container.get<RealmService>(RealmServiceSymbol);
    const env = this.container.get<AbstractEnv>(EnvSymbol);
    const executionContext = this.container.get<ExecutionContextProvider>(
      ExecutionContextSymbol
    );

    const dbName = `vi-test-db-${testName}`;
    let realm: RealmEntity;

    await executionContext.init({ globalTransactionId: uuidv4(), tenantId: null }, async () => {
      realm = await realmService.create({
        name: dbName,
        dbName: dbName,
      });
    });

    return realm!;
  }

  async deleteRealms(realms: RealmEntity[]): Promise<void> {
    const realmService = this.container.get<RealmService>(RealmServiceSymbol);
    const executionContext = this.container.get<ExecutionContextProvider>(
      ExecutionContextSymbol
    );
    const mongodb = this.container.get<MongoDB>(MongoDBSymbol);

    await executionContext.init({ globalTransactionId: uuidv4(), tenantId: null }, async () => {
      for (const realm of realms) {
        const conn = mongodb.getDbConn(realm.dbName);
        await conn.dropDatabase();
        try {
          await realmService.delete(realm._id.toString());
        } catch (error) {
          // Ignore if realm already deleted
        }
      }
    });
  }
}
