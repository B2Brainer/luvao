// /application/use-cases/get-user-by-id.usecase.ts
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';

export class GetUserByIdUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }
}