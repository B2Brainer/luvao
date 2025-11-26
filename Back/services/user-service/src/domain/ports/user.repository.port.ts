// /domain/ports/user.repository.port.ts
import { User } from '../entities/user.entity';

export interface UserRepositoryPort {
  // CRUD básico
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  
  // Búsquedas específicas
  findByEmail(email: string): Promise<User | null>;
  findByEmailAndPassword(email: string, password: string): Promise<User | null>;
}