import { Product } from '../entities/product.entity';

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  filterByType(type: string): Promise<Product[]>;
  filterByTypeAndStores(type: string, storeIds: number[]): Promise<Product[]>;
  createMany(products: Product[]): Promise<{ count: number }>;
}