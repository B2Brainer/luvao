import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(@Inject('UserRepository') private readonly userRepo: IUserRepository) {}

  async execute(email: string, password: string): Promise<User> {
    const exists = await this.userRepo.findByEmail(email);
    if (exists) throw new Error('User already exists');
    const user = new User(Date.now().toString(), email, password);
    return this.userRepo.create(user);
  }
}
