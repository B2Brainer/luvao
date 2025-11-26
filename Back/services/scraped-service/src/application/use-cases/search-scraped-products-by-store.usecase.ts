// search-scraped-products-by-store.usecase.ts
import { ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';
import { ScrapedProduct } from '../../domain/entities/scraped-product.entity';

export class SearchScrapedProductsByStoreUseCase {
  constructor(private readonly repo: ScrapedProductRepositoryPort) {}

  async execute(storeName: string) : Promise<ScrapedProduct[]> {
    return this.repo.findByFilters({ storeName });
  }
}
