// /application/use-cases/get-all-stores.usecase.ts
import { StoreRepositoryPort } from '../../domain/ports/store.repository.port';
import { Store } from '../../domain/entities/store.entity';

export class GetAllStoresUseCase {
  constructor(private readonly storeRepo: StoreRepositoryPort) {}

  async execute(): Promise<Store[]> {
    return this.storeRepo.findAll();
  }
}
