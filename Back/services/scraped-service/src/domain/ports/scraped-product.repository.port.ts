// src/domain/ports/scraped-product.repository.port.ts
import { ScrapedProduct } from "../entities/scraped-product.entity";

export interface ScrapedProductRepositoryPort {

  bulkReplace(storeName: string, query: string, products: ScrapedProduct[]): Promise<void>;
  update(product: ScrapedProduct): Promise<ScrapedProduct>;
  delete(id: string): Promise<void>;

  findAll(): Promise<ScrapedProduct[]>;
  findById(id: string): Promise<ScrapedProduct | null>;
  findByFilters(filters: { storeName?: string; query?: string; name?: string; availability?: boolean; }): Promise<ScrapedProduct[]>;

  exists(id: string): Promise<boolean>;
}
