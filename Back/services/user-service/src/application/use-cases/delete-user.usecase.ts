// /application/use-cases/delete-user.usecase.ts
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';

export class DeleteUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(id: string): Promise<void> {
    // Verificar que el usuario existe
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return this.userRepo.delete(id);
  }
}