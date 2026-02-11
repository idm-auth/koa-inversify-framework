import { validateAuthentication, authorize } from '@idm-auth/auth-client';
import type {
  AuthenticationValidationRequest,
  AuthenticationValidationResponse,
  AuthorizationRequest,
  AuthorizationResponse,
} from '@idm-auth/auth-client';
import { Configuration } from '@/stereotype/configuration.stereotype';
import { AbstractEnv, EnvSymbol } from '@/index';
import { EnvKey } from '@/common/env.types';
import {
  LoggerProvider,
  LoggerSymbol,
} from '@/infrastructure/logger/logger.provider';
import { inject } from 'inversify';
import { AxiosHttpClient } from './httpClient.adapter';

export const IdmClientSymbol = Symbol.for('IdmClient');

@Configuration(IdmClientSymbol)
export class IdmClient {
  private httpClient: AxiosHttpClient;
  private idmAuthServiceUrl: string;
  private application: string;

  constructor(
    @inject(EnvSymbol) private env: AbstractEnv,
    @inject(LoggerSymbol) private loggerProvider: LoggerProvider
  ) {
    this.httpClient = new AxiosHttpClient(5000);
    this.idmAuthServiceUrl = this.env.get(EnvKey.IDM_AUTH_SERVICE_URL);
    this.application = this.env.get(EnvKey.APPLICATION_NAME);
  }

  async validateAuthentication(
    token: string,
    tenantId: string
  ): Promise<AuthenticationValidationResponse> {
    const logger = this.loggerProvider.getLogger();
    logger.debug(
      { idmAuthServiceUrl: this.idmAuthServiceUrl, tenantId },
      'IdmClient.validateAuthentication - calling'
    );
    const request: AuthenticationValidationRequest = {
      system: this.application,
      token,
      applicationRealmPublicUUID: tenantId,
    };
    return validateAuthentication(
      this.httpClient,
      this.idmAuthServiceUrl,
      request
    );
  }

  async authorize(
    request: AuthorizationRequest
  ): Promise<AuthorizationResponse> {
    return authorize(this.httpClient, this.idmAuthServiceUrl, request);
  }
}
