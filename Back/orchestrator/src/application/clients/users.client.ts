// /application/clients/users.client.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import type { AxiosError } from 'axios';
import { SERVICES } from '../../config/orchestrator.config';

const RETRYABLE_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EAI_AGAIN',
]);
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

@Injectable()
export class UsersClient {
  constructor(private http: HttpService) {}

  async authenticateUser(email: string, password: string) {
    const response = await this.withRetry(() => this.http.axiosRef.post(
      `${SERVICES.USER}/users/authenticate`,
      { email, password }
    ));
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.withRetry(() => this.http.axiosRef.post(
      `${SERVICES.USER}/users`,
      data
    ));
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.withRetry(() => this.http.axiosRef.put(
      `${SERVICES.USER}/users/${id}`,
      data
    ));
    return response.data;
  }

  async getUserByEmail(email: string) {
    const response = await this.withRetry(() => this.http.axiosRef.get(
      `${SERVICES.USER}/users/email/${email}`
    ));
    return response.data;
  }

  private async withRetry<T>(request: () => Promise<T>, attempts = 6): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await request();
      } catch (error) {
        lastError = error;

        if (attempt === attempts || !this.isRetryable(error)) {
          throw error;
        }

        await this.wait(Math.min(500 * attempt, 2500));
      }
    }

    throw lastError;
  }

  private isRetryable(error: unknown): boolean {
    const axiosError = error as AxiosError | undefined;
    const status = axiosError?.response?.status;
    const code = axiosError?.code;

    return (
      (typeof status === 'number' && RETRYABLE_STATUS_CODES.has(status)) ||
      (typeof code === 'string' && RETRYABLE_ERROR_CODES.has(code))
    );
  }

  private wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
