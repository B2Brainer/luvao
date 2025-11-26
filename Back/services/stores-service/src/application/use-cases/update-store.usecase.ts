// /application/use-cases/update-store.usecase.ts
import { StoreRepositoryPort } from '../../domain/ports/store.repository.port';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { Store } from '../../domain/entities/store.entity';

export class UpdateStoreUseCase {
  constructor(private readonly storeRepo: StoreRepositoryPort) {}

  async execute(input: UpdateStoreDto): Promise<Store> {
    // Verificar que exista
    const existing = await this.storeRepo.findById(input.id);
    if (!existing) {
      throw new Error('Store not found');
    }

    // Actualizar campos
    const updated = new Store(
      input.id,
      input.name ?? existing.name,
      input.baseUrl ?? existing.baseUrl,
      input.searchPath ?? existing.searchPath,
    );

    return this.storeRepo.save(updated);
  }
}
