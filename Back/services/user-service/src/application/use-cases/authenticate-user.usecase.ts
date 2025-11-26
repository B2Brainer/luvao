// /application/use-cases/authenticate-user.usecase.ts
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';

export class AuthenticateUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(email: string, password: string): Promise<boolean> {
    const user = await this.userRepo.findByEmailAndPassword(email, password);
    return user !== null;
  }
}