import { StoreEntity } from '../entities/store.entity';

export interface StoreRepositoryPort {
  findAll(): Promise<StoreEntity[]>;
  findByCategory(category: string): Promise<StoreEntity[]>;
  findById(id: number): Promise<StoreEntity | null>;
  save(store: StoreEntity): Promise<StoreEntity>;
  existsByName(name: string): Promise<boolean>;
}