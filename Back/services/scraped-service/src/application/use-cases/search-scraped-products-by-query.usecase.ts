// search-scraped-products-by-query.usecase.ts
import { ScrapedProductRepositoryPort } from '../../domain/ports/scraped-product.repository.port';
import { ScrapedProduct } from '../../domain/entities/scraped-product.entity';

export class SearchScrapedProductsByQueryUseCase {
  constructor(private readonly repo: ScrapedProductRepositoryPort) {}

  async execute(query: string) : Promise<ScrapedProduct[]> {
    return this.repo.findByFilters({ query });
  }
}
