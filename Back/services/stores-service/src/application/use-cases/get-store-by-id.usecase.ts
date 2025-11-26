// /application/use-cases/get-store-by-id.usecase.ts
import { StoreRepositoryPort } from '../../domain/ports/store.repository.port';
import { Store } from '../../domain/entities/store.entity';

export class GetStoreByIdUseCase {
  constructor(private readonly storeRepo: StoreRepositoryPort) {}

  async execute(id: string): Promise<Store | null> {
    return this.storeRepo.findById(id);
  }
}
