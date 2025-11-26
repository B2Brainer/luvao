// /domain/ports/store.repository.port.ts
import { Store } from '../entities/store.entity';

export interface StoreRepositoryPort {
  // CRUD básico
  save(store: Store): Promise<Store>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Store[]>;

  // Búsquedas específicas
  findByName(name: string): Promise<Store | null>;
  findById(id: string): Promise<Store | null>;
  getAllStoreNames(): Promise<string[]>;

  // Verificación simple (para evitar duplicados)
  existsByName(name: string): Promise<boolean>;
}
