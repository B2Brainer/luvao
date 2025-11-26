// /application/use-cases/find-store-by-name.usecase.ts
import { StoreRepositoryPort } from '../../domain/ports/store.repository.port';
import { Store } from '../../domain/entities/store.entity';

export class FindStoreByNameUseCase {
  constructor(private readonly storeRepo: StoreRepositoryPort) {}

  async execute(name: string): Promise<Store | null> {
    return this.storeRepo.findByName(name);
  }
}
