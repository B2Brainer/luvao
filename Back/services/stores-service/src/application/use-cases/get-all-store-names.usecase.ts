// /application/use-cases/get-all-store-names.usecase.ts
import { StoreRepositoryPort } from '../../domain/ports/store.repository.port';

export class GetAllStoreNamesUseCase {
  constructor(private readonly storeRepo: StoreRepositoryPort) {}

  async execute(): Promise<string[]> {
    return this.storeRepo.getAllStoreNames();
  }
}
