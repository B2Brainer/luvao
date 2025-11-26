// /application/clients/users.client.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SERVICES } from '../../config/orchestrator.config';

@Injectable()
export class UsersClient {
  constructor(private http: HttpService) {}

  async authenticateUser(email: string, password: string) {
    const response = await this.http.axiosRef.post(
      `${SERVICES.USER}/users/authenticate`,
      { email, password }
    );
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.http.axiosRef.post(
      `${SERVICES.USER}/users`,
      data
    );
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.http.axiosRef.put(
      `${SERVICES.USER}/users/${id}`,
      data
    );
    return response.data;
  }

  async getUserByEmail(email: string) {
    const response = await this.http.axiosRef.get(
      `${SERVICES.USER}/users/email/${email}`
    );
    return response.data;
  }
}
