import type { IHttpClient, HttpOptions } from '@idm-auth/auth-client';
import axios from 'axios';

export class AxiosHttpClient implements IHttpClient {
  private axiosInstance: ReturnType<typeof axios.create>;

  constructor(timeout = 5000) {
    this.axiosInstance = axios.create({ timeout });
  }

  async post<T>(url: string, data: unknown, options?: HttpOptions): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, {
      headers: options?.headers,
    });
    return response.data;
  }

  async get<T>(url: string, options?: HttpOptions): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, {
      headers: options?.headers,
    });
    return response.data;
  }
}
