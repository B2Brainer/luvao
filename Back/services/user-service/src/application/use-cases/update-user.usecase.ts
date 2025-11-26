// /application/use-cases/update-user.usecase.ts
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { UpdateUserDto } from '../dto/update-user.dto';

export class UpdateUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(input: UpdateUserDto): Promise<User> {
    // Verificar que el usuario existe
    const existingUser = await this.userRepo.findById(input.id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Validar formato de email si cambió
    if (input.email !== existingUser.email) {
      if (!this.isValidEmail(input.email)) {
        throw new Error('Invalid email format');
      }

      // Verificar que el nuevo email no esté en uso
      const emailExists = await this.userRepo.findByEmail(input.email);
      if (emailExists) {
        throw new Error('Email already in use');
      }
    }

    // Actualizar usuario
    const updatedUser = new User(
      input.id,
      input.name.trim(),
      input.email.toLowerCase().trim(),
      input.password.trim()
    );
    
    return this.userRepo.update(updatedUser);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}