// search-scraped-products-by-filters.usecase.ts
import { ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';
import { ScrapedProduct } from '../../domain/entities/scraped-product.entity';

export class SearchScrapedProductsByFiltersUseCase {
  constructor(private readonly repo: ScrapedProductRepositoryPort) {}

  async execute(filters: {
    storeName?: string;
    query?: string;
    name?: string;
    availability?: boolean;
  }): Promise<ScrapedProduct[]> {
    return this.repo.findByFilters(filters);
  }
}