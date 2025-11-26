// /application/use-cases/get-all-users.usecase.ts
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';

export class GetAllUsersUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(): Promise<User[]> {
    return this.userRepo.findAll();
  }
}