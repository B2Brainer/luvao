// /application/use-cases/create-store.usecase.ts
import { randomUUID } from 'crypto';
import { Store } from '../../domain/entities/store.entity';
import { StoreRepositoryPort } from '../../domain/ports/store.repository.port';
import { CreateStoreDto } from '../dto/create-store.dto';

export class CreateStoreUseCase {
  constructor(private readonly storeRepo: StoreRepositoryPort) {}

  async execute(input: CreateStoreDto): Promise<Store> {
    // Validación: nombre único
    const exists = await this.storeRepo.existsByName(input.name);
    if (exists) {
      throw new Error('Store with this name already exists');
    }

    // Crear entidad Store
    const store = new Store(
      randomUUID(),
      input.name,
      input.baseUrl,
      input.searchPath,
    );

    // Guardar en DB
    return this.storeRepo.save(store);
  }
}
