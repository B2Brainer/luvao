// /application/use-cases/create-user.usecase.ts
import { randomUUID } from 'crypto';
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { CreateUserDto } from '../dto/create-user.dto';

export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(input: CreateUserDto): Promise<User> {
    // Validar formato de email
    if (!this.isValidEmail(input.email)) {
      throw new Error('Invalid email format');
    }

    // Verificar que el email no existe
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Crear entidad
    const user = new User(
      randomUUID(),
      input.name.trim(),
      input.email.toLowerCase().trim(),
      input.password.trim()
    );
    
    // Guardar y devolver entidad
    return this.userRepo.save(user);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}