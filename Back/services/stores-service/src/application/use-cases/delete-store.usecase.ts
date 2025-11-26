// /application/use-cases/delete-store.usecase.ts
import { StoreRepositoryPort } from '../../domain/ports/store.repository.port';

export class DeleteStoreUseCase {
  constructor(private readonly storeRepo: StoreRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const exists = await this.storeRepo.findById(id);
    if (!exists) {
      throw new Error('Store not found');
    }

    return this.storeRepo.delete(id);
  }
}
