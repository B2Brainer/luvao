import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private items: User[] = [];

  async create(user: User): Promise<User> {
    this.items.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const u = this.items.find(x => x.email === email);
    return u ?? null;
  }
}
