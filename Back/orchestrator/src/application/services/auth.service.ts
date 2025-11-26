// /application/services/auth.service.ts
import { Injectable } from '@nestjs/common';
import { UsersClient } from '../clients/users.client';

@Injectable()
export class AuthService {
  constructor(private usersClient: UsersClient) {}

  async login(dto: any) {
    return await this.usersClient.authenticateUser(dto.email, dto.password);
  }

  async register(dto: any) {
    return await this.usersClient.createUser(dto);
  }
}
