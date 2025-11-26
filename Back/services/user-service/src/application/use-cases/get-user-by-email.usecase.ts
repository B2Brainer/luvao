// /application/use-cases/get-user-by-email.usecase.ts
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';

export class GetUserByEmailUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }
}